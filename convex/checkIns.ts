import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { ensureLeagueEnrollment } from "./leagueEnrollment";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const MIN_SESSION_FOR_DEBRIEF_MS = 5 * 60 * 1000;
const SESSION_DEBRIEF_DELAY_MS = 15 * 60 * 1000;

function isVisibleOnRoster(
    checkIn: { isPrivate?: boolean },
    user: { appearAtCourt?: boolean } | null
) {
    if (checkIn.isPrivate) return false;
    if (user?.appearAtCourt === false) return false;
    return true;
}

export const checkIn = mutation({
    args: {
        courtId: v.id("courts"),
        isPrivate: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            throw new Error("Already checked in");
        }

        const now = Date.now();
        const checkInId = await ctx.db.insert("checkIns", {
            userId,
            courtId: args.courtId,
            checkedInAt: now,
            expiresAt: now + TWO_HOURS_MS,
            isPrivate: args.isPrivate ?? false,
        });

        await ensureLeagueEnrollment(ctx, userId);

        return checkInId;
    },
});

export const checkOut = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const checkIn = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!checkIn) {
            throw new Error("Not checked in");
        }

        const sessionMs = Date.now() - checkIn.checkedInAt;
        await ctx.db.delete(checkIn._id);

        if (sessionMs >= MIN_SESSION_FOR_DEBRIEF_MS) {
            await ctx.scheduler.runAfter(
                SESSION_DEBRIEF_DELAY_MS,
                internal.coach.sendSessionDebriefPush,
                {
                    userId,
                    courtId: checkIn.courtId,
                    sessionMinutes: Math.max(5, Math.round(sessionMs / 60_000)),
                }
            );
        }
    },
});

export const getCurrentCheckIns = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) return [];

        const now = Date.now();
        const checkIns = await ctx.db
            .query("checkIns")
            .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
            .collect();

        // Filter out expired and fetch user details
        const activeCheckIns = [];
        for (const checkIn of checkIns) {
            if (checkIn.expiresAt > now) {
                const user = await ctx.db.get(checkIn.userId);
                if (user && isVisibleOnRoster(checkIn, user)) {
                    // Check for blocking relationship
                    const [blockedByMe, blockedByThem] = await Promise.all([
                        ctx.db
                            .query("blockedUsers")
                            .withIndex("by_user_and_blocked", (q) =>
                                q.eq("userId", currentUserId).eq("blockedUserId", checkIn.userId)
                            )
                            .first(),
                        ctx.db
                            .query("blockedUsers")
                            .withIndex("by_user_and_blocked", (q) =>
                                q.eq("userId", checkIn.userId).eq("blockedUserId", currentUserId)
                            )
                            .first(),
                    ]);

                    // Skip if there's any blocking relationship
                    if (!blockedByMe && !blockedByThem) {
                        activeCheckIns.push({
                            ...checkIn,
                            user: {
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                            },
                        });
                    }
                }
            }
        }

        return activeCheckIns;
    },
});

export const getCurrentUserCheckIn = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const checkIn = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!checkIn) {
            return null;
        }

        // Check if expired
        if (checkIn.expiresAt <= Date.now()) {
            return null;
        }

        return checkIn;
    },
});

export const getCourtPresenceSummary = query({
    args: { courtId: v.id("courts") },
    handler: async (ctx, args) => {
        const checkIns = await ctx.db
            .query("checkIns")
            .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
            .collect();

        const now = Date.now();
        let hereNow = 0;
        for (const checkIn of checkIns) {
            if (checkIn.expiresAt <= now) continue;
            const user = await ctx.db.get(checkIn.userId);
            if (user && isVisibleOnRoster(checkIn, user)) {
                hereNow++;
            }
        }

        const visits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_time", (q) => q.eq("courtId", args.courtId))
            .filter((q) => q.gte(q.field("plannedTime"), now))
            .collect();

        return { hereNow, comingSoon: visits.length };
    },
});

// This will be called by the scheduled function
export const cleanupExpired = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expired = await ctx.db
            .query("checkIns")
            .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
            .collect();

        for (const checkIn of expired) {
            await ctx.db.delete(checkIn._id);
        }

        return { deletedCount: expired.length };
    },
});

