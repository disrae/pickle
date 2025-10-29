import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        courtId: v.id("courts"),
        plannedTime: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Don't allow planning for past times
        if (args.plannedTime < Date.now()) {
            throw new Error("Cannot plan for past times");
        }

        // Check if user already has a plan for this exact time
        const existing = await ctx.db
            .query("plannedVisits")
            .withIndex("by_time", (q) =>
                q.eq("courtId", args.courtId).eq("plannedTime", args.plannedTime)
            )
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        if (existing) {
            throw new Error("You already have a plan for this time");
        }

        const visitId = await ctx.db.insert("plannedVisits", {
            userId,
            courtId: args.courtId,
            plannedTime: args.plannedTime,
            createdAt: Date.now(),
        });

        return visitId;
    },
});

export const deleteVisit = mutation({
    args: {
        visitId: v.id("plannedVisits"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const visit = await ctx.db.get(args.visitId);
        if (!visit) {
            throw new Error("Visit not found");
        }

        if (visit.userId !== userId) {
            throw new Error("Not authorized to delete this visit");
        }

        await ctx.db.delete(args.visitId);
    },
});

export const getForCourt = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const visits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_time", (q) => q.eq("courtId", args.courtId))
            .filter((q) => q.gte(q.field("plannedTime"), now))
            .collect();

        // Fetch user details for each visit
        const visitsWithUsers = [];
        for (const visit of visits) {
            const user = await ctx.db.get(visit.userId);
            if (user) {
                visitsWithUsers.push({
                    ...visit,
                    user: {
                        name: user.name,
                        email: user.email,
                    },
                });
            }
        }

        // Sort by planned time
        visitsWithUsers.sort((a, b) => a.plannedTime - b.plannedTime);

        return visitsWithUsers;
    },
});

export const getCurrentUserPlans = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        const now = Date.now();
        const visits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("courtId"), args.courtId),
                    q.gte(q.field("plannedTime"), now)
                )
            )
            .collect();

        // Sort by planned time
        visits.sort((a, b) => a.plannedTime - b.plannedTime);

        return visits;
    },
});

