import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const skillFields = {
    overallLevel: v.optional(v.number()),
    serving: v.optional(v.number()),
    dinking: v.optional(v.number()),
    dropShot: v.optional(v.number()),
    reset: v.optional(v.number()),
    volley: v.optional(v.number()),
    footwork: v.optional(v.number()),
};

export const getForCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        return await ctx.db
            .query("skillsProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
    },
});

export const getForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const profile = await ctx.db
            .query("skillsProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!profile?.confirmedAt) return null;
        return profile;
    },
});

export const proposeProfile = mutation({
    args: skillFields,
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        const existing = await ctx.db
            .query("skillsProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                proposedAt: now,
                updatedAt: now,
                confirmedAt: undefined,
            });
            return existing._id;
        }

        return await ctx.db.insert("skillsProfiles", {
            userId,
            ...args,
            proposedAt: now,
            updatedAt: now,
        });
    },
});

export const confirmProfile = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("skillsProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!profile) throw new Error("No profile to confirm");

        const now = Date.now();
        await ctx.db.patch(profile._id, {
            confirmedAt: now,
            updatedAt: now,
        });
        await ctx.db.patch(userId, { coachOnboardingComplete: true });
    },
});
