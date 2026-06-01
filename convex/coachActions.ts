"use node";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const COACH_SYSTEM = `You are the WePickle coach — friendly, concise, pickleball-native. Your job is to interview the player and build their skills profile.

Ask ONE question at a time. Cover: overall experience, serving, dinking, drop shots, resets, volleys, footwork. Keep it conversational, not a form.

When you have enough info to rate them (1.0–5.5 scale, like DUPR), propose their profile in this exact JSON block on its own line:
PROFILE: {"overallLevel":3.5,"serving":3.0,"dinking":3.5,"dropShot":3.0,"reset":3.0,"volley":3.5,"footwork":3.0}

Only output PROFILE once, when ready. Before that, keep interviewing.`;

export const sendMessage = action({
    args: { message: v.string() },
    handler: async (ctx, { message }): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const userId = identity.subject as Id<"users">;

        const history = await ctx.runQuery(internal.coach.getMessagesInternal, { userId });
        const messages: Array<{ role: "user" | "assistant"; content: string }> = history.map(
            (m: { role: string; content: string }) => ({
                role: m.role === "user" ? ("user" as const) : ("assistant" as const),
                content: m.content,
            })
        );

        const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            system: COACH_SYSTEM,
            messages: [...messages, { role: "user", content: message }],
        });

        await ctx.runMutation(internal.coach.saveMessages, {
            userId,
            userMessage: message,
            assistantMessage: text,
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

        return text.replace(/PROFILE:\s*\{[\s\S]*?\}/, "").trim();
    },
});
