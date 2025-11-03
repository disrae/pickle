import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("courts").collect();
    },
});

export const get = query({
    args: { id: v.id("courts") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getDefault = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);

        // If user is authenticated and has a selected court, return it
        if (userId) {
            const user = await ctx.db.get(userId);
            if (user?.selectedCourtId) {
                const selectedCourt = await ctx.db.get(user.selectedCourtId);
                if (selectedCourt) {
                    return selectedCourt;
                }
            }
        }

        // Fallback: return Jericho Beach for unauthenticated users
        const jerichoCourt = await ctx.db
            .query("courts")
            .filter((q) => q.eq(q.field("name"), "Jericho Beach"))
            .first();

        if (jerichoCourt) {
            return jerichoCourt;
        }

        // If Jericho Beach doesn't exist, return the first court in the database
        const firstCourt = await ctx.db.query("courts").first();
        return firstCourt;
    },
});

// Seeder mutation to create initial courts
// Run this once from Convex dashboard
export const seedInitialCourt = mutation({
    args: {},
    handler: async (ctx) => {
        const results = [];

        // Define the courts to seed
        const courtsToSeed = [
            {
                name: "Queen Elizabeth Park",
                location: { lat: 49.237805, lng: 123.111925 }
            },
            {
                name: "Jericho Beach",
                location: { lat: 49.273685, lng: -123.199509 }
            }
        ];

        for (const courtData of courtsToSeed) {
            // Check if court already exists
            const existing = await ctx.db
                .query("courts")
                .filter((q) => q.eq(q.field("name"), courtData.name))
                .first();

            if (existing) {
                results.push({ message: `${courtData.name} court already exists`, courtId: existing._id });
            } else {
                // Create the court
                const courtId = await ctx.db.insert("courts", {
                    name: courtData.name,
                    location: courtData.location,
                    notes: undefined,
                });
                results.push({ message: `${courtData.name} court created`, courtId });
            }
        }

        return { results };
    },
});

// Update court notes
export const updateNotes = mutation({
    args: {
        courtId: v.id("courts"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.courtId, {
            notes: args.notes,
        });
    },
});

