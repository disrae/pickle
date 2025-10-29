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
        const courts = await ctx.db.query("courts").collect();
        return courts[0] ?? null;
    },
});

// Seeder mutation to create initial court
// Run this once from Convex dashboard
export const seedInitialCourt = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if Jericho Beach court already exists
        const existing = await ctx.db
            .query("courts")
            .filter((q) => q.eq(q.field("name"), "Queen Elizabeth Park"))
            .first();

        if (existing) {
            return { message: "Queen Elizabeth Park court already exists", courtId: existing._id };
        }

        // Create Queen Elizabeth Park court
        const courtId = await ctx.db.insert("courts", {
            name: "Queen Elizabeth Park",
            location: {
                lat: 49.237805,
                lng: 123.111925,
            },
            notes: undefined,
        });

        return { message: "Queen Elizabeth Park court created", courtId };
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

