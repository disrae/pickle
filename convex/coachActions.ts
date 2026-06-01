"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

function stripProfileFromCoachMessage(content: string): string {
    return content.replace(/PROFILE:\s*\{[\s\S]*?\}/g, "").trim();
}

const COACH_SYSTEM = `You're the WePickle coach — text like a real person at the courts, not a support bot.

Voice:
- Short. One or two sentences usually. Ask one thing at a time.
- Plain words. Contractions fine. No hype, no cheerleading, no "Great question!" or "Absolutely!" or "I'd love to help."
- Don't restate what they just said. Don't sign off. Don't explain that you're building a profile — just ask the next thing.
- Okay to be dry or lightly teasing if it fits. Never stiff or salesy.

PHASE 1 — onboarding (until you output a profile):
- Figure out their level through natural back-and-forth: experience, serving, dinking, drop shots, resets, volleys, footwork.
- When you can rate them (1.0–5.5, DUPR-style), output this EXACT JSON on its own line:
PROFILE: {"overallLevel":3.5,"serving":3.0,"dinking":3.5,"dropShot":3.0,"reset":3.0,"volley":3.5,"footwork":3.0}
- PROFILE once only. After PROFILE, one short line on their game only — never say "confirm in the app", buttons, or "build from there"; the UI shows levels to approve.

PHASE 2 — after PROFILE was already sent in this thread:
- Help with pickleball: what to work on, drills for weak spots, match mindset. Use their numbers when useful.
- Don't output PROFILE again unless they ask to re-rate. If they do, one fresh PROFILE line with updated numbers.`;

export const sendMessage = action({
    args: { message: v.string() },
    handler: async (ctx, { message }): Promise<string> => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const history = await ctx.runQuery(internal.coach.getMessagesInternal, { userId });
        const messages: Array<{ role: "user" | "assistant"; content: string }> = history.map(
            (m: { role: string; content: string }) => ({
                role: m.role === "user" ? ("user" as const) : ("assistant" as const),
                content: m.content,
            })
        );

        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            system: COACH_SYSTEM,
            messages: [...messages, { role: "user", content: message }],
        });

        const displayText = stripProfileFromCoachMessage(text);

        await ctx.runMutation(internal.coach.saveMessages, {
            userId,
            userMessage: message,
            assistantMessage: displayText,
        });

        const profileMatch = text.match(/PROFILE:\s*(\{[\s\S]*?\})/);
        if (profileMatch) {
            try {
                const profile = JSON.parse(profileMatch[1]) as {
                    overallLevel?: number;
                    serving?: number;
                    dinking?: number;
                    dropShot?: number;
                    reset?: number;
                    volley?: number;
                    footwork?: number;
                };
                await ctx.runMutation(internal.coach.saveProposedProfile, {
                    userId,
                    ...profile,
                });
            } catch {
                // Profile parse failed — coach will retry
            }
        }

        return displayText;
    },
});
