import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's progress for a specific drill
export const getUserProgress = query({
    args: { drillId: v.id("drills") },
    handler: async (ctx, { drillId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const progress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user_drill", (q) =>
                q.eq("userId", userId).eq("drillId", drillId)
            )
            .first();

        return progress;
    },
});

// Complete a milestone for a drill
export const completeMilestone = mutation({
    args: {
        drillId: v.id("drills"),
        milestoneIndex: v.number(),
    },
    handler: async (ctx, { drillId, milestoneIndex }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Get or create progress
        const existingProgress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user_drill", (q) =>
                q.eq("userId", userId).eq("drillId", drillId)
            )
            .first();

        if (existingProgress) {
            // Add milestone if not already completed
            if (!existingProgress.completedMilestones.includes(milestoneIndex)) {
                await ctx.db.patch(existingProgress._id, {
                    completedMilestones: [
                        ...existingProgress.completedMilestones,
                        milestoneIndex,
                    ],
                    lastPracticedAt: Date.now(),
                });
            }
        } else {
            // Create new progress
            await ctx.db.insert("drillProgress", {
                userId,
                drillId,
                completedMilestones: [milestoneIndex],
                lastPracticedAt: Date.now(),
                totalSessions: 0,
            });
        }
    },
});

// Update personal best for a drill
export const updatePersonalBest = mutation({
    args: {
        drillId: v.id("drills"),
        value: v.number(),
    },
    handler: async (ctx, { drillId, value }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existingProgress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user_drill", (q) =>
                q.eq("userId", userId).eq("drillId", drillId)
            )
            .first();

        const now = Date.now();

        if (existingProgress) {
            // Only update if new value is better than existing PB
            if (!existingProgress.personalBest || value > existingProgress.personalBest) {
                await ctx.db.patch(existingProgress._id, {
                    personalBest: value,
                    lastPracticedAt: now,
                    totalSessions: existingProgress.totalSessions + 1,
                });
            } else {
                // Just update last practiced and sessions
                await ctx.db.patch(existingProgress._id, {
                    lastPracticedAt: now,
                    totalSessions: existingProgress.totalSessions + 1,
                });
            }
        } else {
            // Create new progress
            await ctx.db.insert("drillProgress", {
                userId,
                drillId,
                completedMilestones: [],
                personalBest: value,
                lastPracticedAt: now,
                totalSessions: 1,
            });
        }
    },
});

// Get user's weekly stats
export const getUserStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return {
                drillsCompleted: 0,
                minutesPracticed: 0,
                sessionsThisWeek: 0,
            };
        }

        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const allProgress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Count drills practiced this week
        const recentProgress = allProgress.filter(
            (p) => p.lastPracticedAt && p.lastPracticedAt >= oneWeekAgo
        );

        // For now, estimate minutes based on sessions (assume 15 min per session)
        const sessionsThisWeek = recentProgress.reduce(
            (sum, p) => sum + p.totalSessions,
            0
        );
        const minutesPracticed = sessionsThisWeek * 15;

        // Count unique drills with any progress
        const drillsCompleted = recentProgress.length;

        return {
            drillsCompleted,
            minutesPracticed,
            sessionsThisWeek,
        };
    },
});

// Get all user's drill progress (for profile/stats page)
export const getAllUserProgress = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const allProgress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Get drill details for each progress
        const progressWithDrills = await Promise.all(
            allProgress.map(async (progress) => {
                const drill = await ctx.db.get(progress.drillId);
                return {
                    ...progress,
                    drill: drill
                        ? {
                              title: drill.title,
                              category: drill.category,
                              difficulty: drill.difficulty,
                          }
                        : null,
                };
            })
        );

        return progressWithDrills.filter((p) => p.drill !== null);
    },
});

