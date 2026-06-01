import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

export const getMessages = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("coachMessages")
            .withIndex("by_user_created", (q) => q.eq("userId", userId))
            .order("asc")
            .collect();
    },
});

export const startInterview = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("coachMessages")
            .withIndex("by_user_created", (q) => q.eq("userId", userId))
            .first();

        if (existing) return;

        await ctx.db.insert("coachMessages", {
            userId,
            role: "assistant",
            content: "Hey, how long have you been playing?",
            createdAt: Date.now(),
        });
    },
});

export const getMessagesInternal = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("coachMessages")
            .withIndex("by_user_created", (q) => q.eq("userId", userId))
            .order("asc")
            .collect();
    },
});

export const saveMessages = internalMutation({
    args: {
        userId: v.id("users"),
        userMessage: v.string(),
        assistantMessage: v.string(),
    },
    handler: async (ctx, { userId, userMessage, assistantMessage }) => {
        const now = Date.now();
        await ctx.db.insert("coachMessages", {
            userId,
            role: "user",
            content: userMessage,
            createdAt: now,
        });
        await ctx.db.insert("coachMessages", {
            userId,
            role: "assistant",
            content: assistantMessage,
            createdAt: now + 1,
        });
    },
});

export const saveProposedProfile = internalMutation({
    args: {
        userId: v.id("users"),
        overallLevel: v.optional(v.number()),
        serving: v.optional(v.number()),
        dinking: v.optional(v.number()),
        dropShot: v.optional(v.number()),
        reset: v.optional(v.number()),
        volley: v.optional(v.number()),
        footwork: v.optional(v.number()),
    },
    handler: async (ctx, { userId, ...skills }) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("skillsProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...skills,
                proposedAt: now,
                updatedAt: now,
                confirmedAt: undefined,
            });
        } else {
            await ctx.db.insert("skillsProfiles", {
                userId,
                ...skills,
                proposedAt: now,
                updatedAt: now,
            });
        }
    },
});

/**
 * Inject post-match debrief context into the coach conversation.
 * Called when the user taps the debrief banner.
 * Inserts a user message with match context so the coach responds in debrief mode.
 */
export const injectDebriefContext = mutation({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const match = await ctx.db.get(matchId);
        if (!match) throw new Error("Match not found");

        const isP1Side = match.p1Id === userId || match.p2Id === userId;
        const myScore = isP1Side ? match.score1 : match.score2;
        const oppScore = isP1Side ? match.score2 : match.score1;
        const won = myScore > oppScore;

        const [p1, p3] = await Promise.all([
            ctx.db.get(match.p1Id),
            ctx.db.get(match.p3Id),
        ]);

        const oppSide = isP1Side
            ? p3?.name ?? "Opponent"
            : p1?.name ?? "Opponent";

        const contextMsg = `Post-match debrief: I just ${won ? "won" : "lost"} ${myScore}–${oppScore} against ${oppSide} in a ${match.format} match. Can you help me break it down?`;

        const now = Date.now();
        await ctx.db.insert("coachMessages", {
            userId,
            role: "user",
            content: contextMsg,
            createdAt: now,
        });

        // Mark debrief as triggered for this user's side
        if (isP1Side) {
            await ctx.db.patch(matchId, { debriefTriggeredP1: true });
        } else {
            await ctx.db.patch(matchId, { debriefTriggeredP3: true });
        }

        return contextMsg;
    },
});

/** Dev only: wipe all coach chat + profiles so onboarding can be retested. */
export const resetCoachDev = mutation({
    args: { confirm: v.string() },
    handler: async (ctx, { confirm }) => {
        if (confirm !== "RESET_COACH") {
            throw new Error('Pass confirm: "RESET_COACH"');
        }

        let deleted = 0;
        for (const row of await ctx.db.query("coachMessages").collect()) {
            await ctx.db.delete(row._id);
            deleted++;
        }
        for (const row of await ctx.db.query("skillsProfiles").collect()) {
            await ctx.db.delete(row._id);
            deleted++;
        }
        for (const user of await ctx.db.query("users").collect()) {
            if (user.coachOnboardingComplete !== undefined) {
                await ctx.db.patch(user._id, { coachOnboardingComplete: undefined });
                deleted++;
            }
        }
        return { deleted };
    },
});
