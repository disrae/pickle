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

// Report lineup count
export const reportLineup = mutation({
    args: {
        courtId: v.id("courts"),
        lineupCount: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Validate user is checked in at this court
        const checkIn = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!checkIn) {
            throw new Error("Must be checked in to report lineup");
        }

        if (checkIn.courtId !== args.courtId) {
            throw new Error("Must be checked in at this court to report lineup");
        }

        // Check if expired
        if (checkIn.expiresAt <= Date.now()) {
            throw new Error("Check-in has expired");
        }

        // Validate lineup count
        if (args.lineupCount < 0) {
            throw new Error("Lineup count cannot be negative");
        }

        const court = await ctx.db.get(args.courtId);
        if (!court) {
            throw new Error("Court not found");
        }

        const maxSlots = court.lineupSlots || 10;
        if (args.lineupCount > maxSlots) {
            throw new Error(`Lineup count cannot exceed ${maxSlots}`);
        }

        const now = Date.now();

        // Update court
        await ctx.db.patch(args.courtId, {
            currentLineupCount: args.lineupCount,
            lineupReportedBy: userId,
            lineupReportedAt: now,
        });

        // Create history entry
        await ctx.db.insert("lineupReports", {
            courtId: args.courtId,
            userId,
            lineupCount: args.lineupCount,
            reportedAt: now,
        });
    },
});

// Report court as dry
export const reportCourtDry = mutation({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Validate user is checked in at this court
        const checkIn = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!checkIn) {
            throw new Error("Must be checked in to report court condition");
        }

        if (checkIn.courtId !== args.courtId) {
            throw new Error("Must be checked in at this court to report condition");
        }

        // Check if expired
        if (checkIn.expiresAt <= Date.now()) {
            throw new Error("Check-in has expired");
        }

        const now = Date.now();

        // Update court
        await ctx.db.patch(args.courtId, {
            courtReportedDryAt: now,
            courtReportedDryBy: userId,
        });

        // Create history entry
        await ctx.db.insert("conditionReports", {
            courtId: args.courtId,
            userId,
            reportedAt: now,
        });
    },
});

// Helper query to check if court is currently dry (within 5 hours)
export const isCourtDry = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const court = await ctx.db.get(args.courtId);
        if (!court || !court.courtReportedDryAt) {
            return false;
        }

        const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
        const now = Date.now();
        return (now - court.courtReportedDryAt) < FIVE_HOURS_MS;
    },
});

// Helper query to check if lineup report is still valid (within 1 hour)
export const isLineupValid = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const court = await ctx.db.get(args.courtId);
        if (!court || court.currentLineupCount === undefined || !court.lineupReportedAt) {
            return false;
        }

        const ONE_HOUR_MS = 60 * 60 * 1000;
        const now = Date.now();
        return (now - court.lineupReportedAt) < ONE_HOUR_MS;
    },
});

// Get lineup reporter info
export const getLineupReporter = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return null;
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        return {
            name: user.name,
            email: user.email,
        };
    },
});

// Get condition reporter info
export const getConditionReporter = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return null;
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        return {
            name: user.name,
            email: user.email,
        };
    },
});

