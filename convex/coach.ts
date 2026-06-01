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
            content:
                "Hey! I'm your WePickle coach. I'll ask a few quick questions to figure out where you're at — takes about 2 minutes. Ready? How long have you been playing pickleball?",
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
