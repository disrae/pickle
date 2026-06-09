import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";

function isVisibleOnRoster(
    checkIn: { isPrivate?: boolean },
    user: { appearAtCourt?: boolean } | null
) {
    if (checkIn.isPrivate) return false;
    if (user?.appearAtCourt === false) return false;
    return true;
}

async function courtScopedRatings(ctx: QueryCtx, courtId: Id<"courts">) {
    const courtUsers = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("selectedCourtId"), courtId))
        .collect();
    const ids = new Set(courtUsers.map((u) => u._id));

    const ratings = await ctx.db.query("individualRatings").collect();
    return ratings
        .filter((r) => ids.has(r.userId))
        .sort((a, b) => b.rating - a.rating);
}

export const memberCounts = query({
    args: {},
    handler: async (ctx) => {
        const courts = await ctx.db.query("courts").collect();
        const users = await ctx.db.query("users").collect();

        const counts = new Map<string, number>();
        for (const user of users) {
            if (user.selectedCourtId) {
                counts.set(user.selectedCourtId, (counts.get(user.selectedCourtId) ?? 0) + 1);
            }
        }

        return courts.map((court) => ({
            courtId: court._id,
            memberCount: counts.get(court._id) ?? 0,
        }));
    },
});

export const leagueSummary = query({
    args: { courtId: v.id("courts") },
    handler: async (ctx, { courtId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const court = await ctx.db.get(courtId);
        if (!court) return null;

        const courtUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("selectedCourtId"), courtId))
            .collect();
        const memberCount = courtUsers.length;

        const now = Date.now();
        const checkIns = await ctx.db
            .query("checkIns")
            .withIndex("by_court", (q) => q.eq("courtId", courtId))
            .collect();

        let activeNow = 0;
        for (const checkIn of checkIns) {
            if (checkIn.expiresAt <= now) continue;
            const user = await ctx.db.get(checkIn.userId);
            if (user && isVisibleOnRoster(checkIn, user)) {
                activeNow++;
            }
        }

        const sortedRatings = await courtScopedRatings(ctx, courtId);

        let myRank: number | null = null;
        let myRating: number | null = null;
        let myMatchesPlayed: number | null = null;

        const myEntry = sortedRatings.find((r) => r.userId === userId);
        if (myEntry) {
            myRank = sortedRatings.indexOf(myEntry) + 1;
            myRating = myEntry.rating;
            myMatchesPlayed = myEntry.matchesPlayed;
        }

        const topPlayers = await Promise.all(
            sortedRatings.slice(0, 3).map(async (r, i) => {
                const user = await ctx.db.get(r.userId);
                return {
                    rank: i + 1,
                    userId: r.userId,
                    rating: r.rating,
                    matchesPlayed: r.matchesPlayed,
                    isMe: r.userId === userId,
                    user: user
                        ? {
                              _id: user._id,
                              name: user.name,
                              email: user.email,
                          }
                        : null,
                };
            })
        );

        return {
            courtId,
            courtName: court.name,
            memberCount,
            activeNow,
            myRank,
            myRating,
            myMatchesPlayed,
            topPlayers,
        };
    },
});
