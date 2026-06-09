import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export const PROVISIONAL_RATING = 1200;

export async function ensureLeagueEnrollment(ctx: MutationCtx, userId: Id<"users">) {
    const existing = await ctx.db
        .query("individualRatings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

    if (existing) return;

    await ctx.db.insert("individualRatings", {
        userId,
        rating: PROVISIONAL_RATING,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        updatedAt: Date.now(),
    });
}
