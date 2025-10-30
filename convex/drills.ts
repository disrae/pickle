import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all drills with optional filters
export const list = query({
    args: {
        category: v.optional(v.string()),
        difficulty: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        searchTerm: v.optional(v.string()),
    },
    handler: async (ctx, { category, difficulty, tags, searchTerm }) => {
        let drills;

        // Start with category filter if provided
        if (category) {
            drills = await ctx.db
                .query("drills")
                .withIndex("by_category", (q) => q.eq("category", category))
                .collect();
        } else {
            drills = await ctx.db.query("drills").collect();
        }

        // Filter by difficulty if provided
        if (difficulty) {
            drills = drills.filter((drill) => drill.difficulty === difficulty);
        }

        // Filter by tags if provided
        if (tags && tags.length > 0) {
            drills = drills.filter((drill) =>
                tags.some((tag) => drill.tags.includes(tag))
            );
        }

        // Filter by search term if provided
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            drills = drills.filter(
                (drill) =>
                    drill.title.toLowerCase().includes(searchLower) ||
                    drill.description.toLowerCase().includes(searchLower)
            );
        }

        // Get creator info for each drill
        const drillsWithCreator = await Promise.all(
            drills.map(async (drill) => {
                const creator = await ctx.db.get(drill.createdBy);
                return {
                    ...drill,
                    creator: creator
                        ? { name: creator.name, email: creator.email }
                        : null,
                };
            })
        );

        // Sort: official first, then by creation date
        return drillsWithCreator.sort((a, b) => {
            if (a.isOfficial && !b.isOfficial) return -1;
            if (!a.isOfficial && b.isOfficial) return 1;
            return b.createdAt - a.createdAt;
        });
    },
});

// Get a single drill by ID
export const get = query({
    args: { drillId: v.id("drills") },
    handler: async (ctx, { drillId }) => {
        const drill = await ctx.db.get(drillId);
        if (!drill) return null;

        const creator = await ctx.db.get(drill.createdBy);
        return {
            ...drill,
            creator: creator ? { name: creator.name, email: creator.email } : null,
        };
    },
});

// Create a new drill
export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
        difficulty: v.string(),
        tags: v.array(v.string()),
        milestones: v.array(
            v.object({
                count: v.number(),
                description: v.string(),
            })
        ),
        metricType: v.string(),
        metricDescription: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        const isOfficial = user?.isAdmin ?? false;

        const drillId = await ctx.db.insert("drills", {
            ...args,
            createdBy: userId,
            isOfficial,
            createdAt: Date.now(),
        });

        return drillId;
    },
});

// Get popular drills (most practiced)
export const getPopular = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 10 }) => {
        const allProgress = await ctx.db.query("drillProgress").collect();

        // Count sessions per drill
        const drillSessionCounts = allProgress.reduce((acc, progress) => {
            const drillId = progress.drillId;
            acc[drillId] = (acc[drillId] || 0) + progress.totalSessions;
            return acc;
        }, {} as Record<string, number>);

        // Get drill IDs sorted by session count
        const sortedDrillIds = Object.entries(drillSessionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([drillId]) => drillId);

        // Fetch the actual drills
        const drills = await Promise.all(
            sortedDrillIds.map(async (drillId) => {
                const drill = await ctx.db.get(drillId as any);
                if (!drill || drill === null) return null;

                // Type guard to ensure we have a drill document
                if (!('title' in drill) || !('createdBy' in drill)) return null;

                const creator = await ctx.db.get(drill.createdBy);
                return {
                    ...drill,
                    sessionCount: drillSessionCounts[drillId],
                    creator: creator && 'name' in creator && 'email' in creator
                        ? { name: creator.name, email: creator.email }
                        : null,
                };
            })
        );

        return drills.filter((drill) => drill !== null);
    },
});

