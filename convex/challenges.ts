import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { sendExpoPush } from "./pushNotifications";
import { newRating } from "./ratings";

const DEFAULT_RATING = 1000;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Active challenges involving the current user (pending or accepted). */
export const myChallenges = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const [sent, received] = await Promise.all([
            ctx.db
                .query("challenges")
                .withIndex("by_challenger", (q) => q.eq("challengerId", userId))
                .filter((q) =>
                    q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "accepted"))
                )
                .collect(),
            ctx.db
                .query("challenges")
                .withIndex("by_challenged", (q) => q.eq("challengedId", userId))
                .filter((q) =>
                    q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "accepted"))
                )
                .collect(),
        ]);

        return [...sent, ...received];
    },
});

/** Upcoming scheduled matches for the current user. */
export const myScheduledMatches = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const now = Date.now();
        const [asP1, asP3] = await Promise.all([
            ctx.db
                .query("scheduledMatches")
                .withIndex("by_p1", (q) => q.eq("p1Id", userId))
                .filter((q) => q.gte(q.field("scheduledTime"), now))
                .collect(),
            ctx.db
                .query("scheduledMatches")
                .withIndex("by_p3", (q) => q.eq("p3Id", userId))
                .filter((q) => q.gte(q.field("scheduledTime"), now))
                .collect(),
        ]);

        const all = [...asP1, ...asP3];
        all.sort((a, b) => a.scheduledTime - b.scheduledTime);

        return await Promise.all(
            all.map(async (sm) => {
                const [p1, p2, p3, p4, t1, t2] = await Promise.all([
                    ctx.db.get(sm.p1Id),
                    sm.p2Id ? ctx.db.get(sm.p2Id) : null,
                    ctx.db.get(sm.p3Id),
                    sm.p4Id ? ctx.db.get(sm.p4Id) : null,
                    sm.team1Id ? ctx.db.get(sm.team1Id) : null,
                    sm.team2Id ? ctx.db.get(sm.team2Id) : null,
                ]);
                return { ...sm, player1: p1, player2: p2, player3: p3, player4: p4, team1: t1, team2: t2 };
            })
        );
    },
});

/** Matches pending confirmation (reported but not yet confirmed). */
export const pendingConfirmation = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const pending = await ctx.db
            .query("matches")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        // Only return matches where the current user is on the opposing side from the reporter
        return pending.filter(
            (m) =>
                m.reportedBy !== userId &&
                (m.p1Id === userId ||
                    m.p2Id === userId ||
                    m.p3Id === userId ||
                    m.p4Id === userId)
        );
    },
});

/** Matches with debrief pending for the current user. */
export const pendingDebrief = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const confirmed = await ctx.db
            .query("matches")
            .withIndex("by_status", (q) => q.eq("status", "confirmed"))
            .collect();

        return confirmed.filter((m) => {
            const isP1Side = m.p1Id === userId || m.p2Id === userId;
            const isP3Side = m.p3Id === userId || m.p4Id === userId;
            if (isP1Side && !m.debriefTriggeredP1) return true;
            if (isP3Side && !m.debriefTriggeredP3) return true;
            return false;
        });
    },
});

// ---------------------------------------------------------------------------
// Challenge flow
// ---------------------------------------------------------------------------

export const issueChallenge = mutation({
    args: {
        challengedId: v.id("users"),
        challengedPartnerId: v.optional(v.id("users")),
        challengedTeamId: v.optional(v.id("teams")),
        challengerPartnerId: v.optional(v.id("users")),
        challengerTeamId: v.optional(v.id("teams")),
        format: v.union(v.literal("doubles"), v.literal("singles")),
        courtId: v.id("courts"),
        proposedTimes: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        if (args.proposedTimes.length < 2 || args.proposedTimes.length > 3) {
            throw new Error("Please propose 2-3 possible times");
        }

        const now = Date.now();
        const normalizedProposed = [...new Set(args.proposedTimes.map((t) => Math.trunc(t)))]
            .sort((a, b) => a - b);
        if (normalizedProposed.length !== args.proposedTimes.length) {
            throw new Error("Proposed times must be unique");
        }
        if (normalizedProposed.some((t) => t <= now)) {
            throw new Error("All proposed times must be in the future");
        }

        const challengeId = await ctx.db.insert("challenges", {
            challengerId: userId,
            challengerPartnerId: args.challengerPartnerId,
            challengerTeamId: args.challengerTeamId,
            challengedId: args.challengedId,
            challengedPartnerId: args.challengedPartnerId,
            challengedTeamId: args.challengedTeamId,
            format: args.format,
            courtId: args.courtId,
            proposedTimes: normalizedProposed,
            status: "pending",
            createdAt: now,
        });

        // Push challenged player
        const [challenger, challenged] = await Promise.all([
            ctx.db.get(userId),
            ctx.db.get(args.challengedId),
        ]);
        if (challenged?.expoPushToken) {
            const formatLabel = args.format === "doubles" ? "doubles" : "singles";
            await sendExpoPush(
                challenged.expoPushToken,
                "Challenge received 🏓",
                `${challenger?.name ?? "Someone"} challenged you to a ${formatLabel} match — pick a time`
            );
        }

        // Push challenged partner if ad-hoc doubles
        if (args.challengedPartnerId && !args.challengedTeamId) {
            const partner = await ctx.db.get(args.challengedPartnerId);
            if (partner?.expoPushToken) {
                await sendExpoPush(
                    partner.expoPushToken,
                    "Challenge received 🏓",
                    `${challenger?.name ?? "Someone"} challenged your team to a doubles match — pick a time`
                );
            }
        }

        return challengeId;
    },
});

export const respondToChallenge = mutation({
    args: {
        challengeId: v.id("challenges"),
        accept: v.boolean(),
        selectedTime: v.optional(v.number()),
        scheduledTime: v.optional(v.number()),
    },
    handler: async (ctx, { challengeId, accept, selectedTime, scheduledTime }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const challenge = await ctx.db.get(challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.challengedId !== userId && challenge.challengedPartnerId !== userId) {
            throw new Error("Not your challenge");
        }
        if (challenge.status !== "pending") throw new Error("Challenge already resolved");

        const proposedTimes = challenge.proposedTimes ?? [];
        const fallbackTime = scheduledTime ?? Date.now() + 2 * 60 * 60 * 1000;
        let resolvedTime = selectedTime ?? scheduledTime;
        if (accept) {
            if (proposedTimes.length > 0) {
                if (resolvedTime === undefined) {
                    throw new Error("Select one of the proposed times");
                }
                if (!proposedTimes.includes(resolvedTime)) {
                    throw new Error("Selected time must be one of the proposed slots");
                }
            } else {
                // Backward-compatible fallback for old pending challenges.
                resolvedTime = fallbackTime;
            }
        }

        const status = accept ? "accepted" : "declined";
        await ctx.db.patch(challengeId, {
            status,
            respondedAt: Date.now(),
            selectedTime: accept ? resolvedTime : undefined,
        });

        if (accept) {
            // Create scheduled match + auto planned visits
            const smId = await ctx.db.insert("scheduledMatches", {
                challengeId,
                courtId: challenge.courtId,
                scheduledTime: resolvedTime!,
                p1Id: challenge.challengerId,
                p2Id: challenge.challengerPartnerId,
                p3Id: challenge.challengedId,
                p4Id: challenge.challengedPartnerId,
                team1Id: challenge.challengerTeamId,
                team2Id: challenge.challengedTeamId,
                format: challenge.format,
                createdAt: Date.now(),
            });

            // Auto planned visits for all participants
            const participants = [
                challenge.challengerId,
                challenge.challengerPartnerId,
                challenge.challengedId,
                challenge.challengedPartnerId,
            ].filter(Boolean) as string[];

            const st = resolvedTime!;
            for (const pid of participants) {
                await ctx.db.insert("plannedVisits", {
                    userId: pid as any,
                    courtId: challenge.courtId,
                    plannedTime: st,
                    createdAt: Date.now(),
                });
            }

            // Notify challenger
            const challenger = await ctx.db.get(challenge.challengerId);
            const me = await ctx.db.get(userId);
            if (challenger?.expoPushToken) {
                await sendExpoPush(
                    challenger.expoPushToken,
                    "Challenge accepted! 🎉",
                    `${me?.name ?? "Your opponent"} accepted ${formatDateTime(st)}`
                );
            }

            return smId;
        }
    },
});

function formatDateTime(timestamp: number) {
    return new Date(timestamp).toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

// ---------------------------------------------------------------------------
// Match reporting & confirmation
// ---------------------------------------------------------------------------

export const reportMatch = mutation({
    args: {
        challengeId: v.optional(v.id("challenges")),
        courtId: v.id("courts"),
        format: v.union(v.literal("doubles"), v.literal("singles")),
        p1Id: v.id("users"),
        p2Id: v.optional(v.id("users")),
        p3Id: v.id("users"),
        p4Id: v.optional(v.id("users")),
        team1Id: v.optional(v.id("teams")),
        team2Id: v.optional(v.id("teams")),
        score1: v.number(),
        score2: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const matchId = await ctx.db.insert("matches", {
            format: args.format,
            courtId: args.courtId,
            team1Id: args.team1Id,
            team2Id: args.team2Id,
            p1Id: args.p1Id,
            p2Id: args.p2Id,
            p3Id: args.p3Id,
            p4Id: args.p4Id,
            score1: args.score1,
            score2: args.score2,
            reportedBy: userId,
            reportedAt: Date.now(),
            status: "pending",
            createdAt: Date.now(),
        });

        if (args.challengeId) {
            await ctx.db.patch(args.challengeId, { status: "completed", matchId });
        }

        // Notify opposing side to confirm
        const opposingPlayerIds = [args.p3Id, args.p4Id].filter(
            (id): id is typeof args.p3Id => id !== undefined
        );
        const reporter = await ctx.db.get(userId);
        for (const pid of opposingPlayerIds) {
            const player = await ctx.db.get(pid);
            if (player && "expoPushToken" in player && player.expoPushToken) {
                await sendExpoPush(
                    player.expoPushToken,
                    "Confirm match result",
                    `${reporter?.name ?? "Your opponent"} reported the score — tap to confirm`
                );
            }
        }

        await ctx.scheduler.runAfter(
            24 * 60 * 60 * 1000,
            internal.challenges.autoConfirmMatch,
            { matchId }
        );

        return matchId;
    },
});

export const confirmMatch = mutation({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const match = await ctx.db.get(matchId);
        if (!match) throw new Error("Match not found");
        if (match.status !== "pending") throw new Error("Match already resolved");

        const isOpposingSide =
            match.p3Id === userId || match.p4Id === userId;
        if (!isOpposingSide) throw new Error("Only the opposing side can confirm");

        await ctx.db.patch(matchId, {
            status: "confirmed",
            confirmedBy: userId,
            confirmedAt: Date.now(),
        });

        // Update ratings
        await applyRatingUpdates(ctx, match);
    },
});

export const autoConfirmMatch = internalMutation({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const match = await ctx.db.get(matchId);
        if (!match || match.status !== "pending") return;

        await ctx.db.patch(matchId, {
            status: "confirmed",
            confirmedAt: Date.now(),
        });

        await applyRatingUpdates(ctx, match);
    },
});

/** Sweep pending matches older than 24h (backup for missed scheduled jobs). */
export const autoConfirmStaleMatches = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const pending = await ctx.db
            .query("matches")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        for (const match of pending) {
            if (match.reportedAt > cutoff) continue;
            await ctx.db.patch(match._id, {
                status: "confirmed",
                confirmedAt: Date.now(),
            });
            await applyRatingUpdates(ctx, match);
        }
    },
});

// ---------------------------------------------------------------------------
// Internal: apply Elo updates after confirmation
// ---------------------------------------------------------------------------

async function applyRatingUpdates(ctx: any, match: any) {
    const DEFAULT = 1000;

    if (match.format === "singles") {
        const [r1, r3] = await Promise.all([
            ctx.db.query("individualRatings").withIndex("by_user", (q: any) => q.eq("userId", match.p1Id)).first(),
            ctx.db.query("individualRatings").withIndex("by_user", (q: any) => q.eq("userId", match.p3Id)).first(),
        ]);

        const rating1 = r1?.rating ?? DEFAULT;
        const rating3 = r3?.rating ?? DEFAULT;
        const won1 = match.score1 > match.score2;

        const new1 = newRating(rating1, rating3, match.score1, match.score2);
        const new3 = newRating(rating3, rating1, match.score2, match.score1);

        await upsertIndividualRating(ctx, match.p1Id, new1, won1);
        await upsertIndividualRating(ctx, match.p3Id, new3, !won1);
    } else {
        // Doubles — update team ratings + individual ratings for all 4 players
        const avg1 = await avgIndividual(ctx, [match.p1Id, match.p2Id].filter(Boolean), DEFAULT);
        const avg3 = await avgIndividual(ctx, [match.p3Id, match.p4Id].filter(Boolean), DEFAULT);

        const won1 = match.score1 > match.score2;

        // Individual updates (each player rated against avg of opposing team)
        for (const pid of [match.p1Id, match.p2Id].filter(Boolean)) {
            const r = await ctx.db.query("individualRatings").withIndex("by_user", (q: any) => q.eq("userId", pid)).first();
            const updated = newRating(r?.rating ?? DEFAULT, avg3, match.score1, match.score2);
            await upsertIndividualRating(ctx, pid, updated, won1);
        }
        for (const pid of [match.p3Id, match.p4Id].filter(Boolean)) {
            const r = await ctx.db.query("individualRatings").withIndex("by_user", (q: any) => q.eq("userId", pid)).first();
            const updated = newRating(r?.rating ?? DEFAULT, avg1, match.score2, match.score1);
            await upsertIndividualRating(ctx, pid, updated, !won1);
        }

        // Team rating updates
        if (match.team1Id && match.team2Id) {
            const [t1, t2] = await Promise.all([ctx.db.get(match.team1Id), ctx.db.get(match.team2Id)]);
            if (t1 && t2) {
                const newT1 = newRating(t1.rating, t2.rating, match.score1, match.score2);
                const newT2 = newRating(t2.rating, t1.rating, match.score2, match.score1);
                await ctx.db.patch(match.team1Id, {
                    rating: newT1,
                    matchesPlayed: t1.matchesPlayed + 1,
                    wins: t1.wins + (won1 ? 1 : 0),
                    losses: t1.losses + (won1 ? 0 : 1),
                });
                await ctx.db.patch(match.team2Id, {
                    rating: newT2,
                    matchesPlayed: t2.matchesPlayed + 1,
                    wins: t2.wins + (won1 ? 0 : 1),
                    losses: t2.losses + (won1 ? 1 : 0),
                });
            }
        }
    }

    // Flag debrief as needed for both sides
    await ctx.db.patch(match._id, {
        debriefTriggeredP1: false,
        debriefTriggeredP3: false,
    });

    await ctx.scheduler.runAfter(0, internal.coach.notifyMatchDebrief, { matchId: match._id });
}

async function avgIndividual(ctx: any, playerIds: string[], fallback: number) {
    const ratings = await Promise.all(
        playerIds.map((pid) =>
            ctx.db.query("individualRatings").withIndex("by_user", (q: any) => q.eq("userId", pid)).first()
        )
    );
    const vals = ratings.map((r: any) => r?.rating ?? fallback);
    return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
}

async function upsertIndividualRating(ctx: any, userId: string, rating: number, won: boolean) {
    const existing = await ctx.db
        .query("individualRatings")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .first();

    if (existing) {
        await ctx.db.patch(existing._id, {
            rating,
            matchesPlayed: existing.matchesPlayed + 1,
            wins: existing.wins + (won ? 1 : 0),
            losses: existing.losses + (won ? 0 : 1),
            updatedAt: Date.now(),
        });
    } else {
        await ctx.db.insert("individualRatings", {
            userId: userId as any,
            rating,
            matchesPlayed: 1,
            wins: won ? 1 : 0,
            losses: won ? 0 : 1,
            updatedAt: Date.now(),
        });
    }
}

// ---------------------------------------------------------------------------
// Ladder queries
// ---------------------------------------------------------------------------

/** Singles ladder — individual ratings, optionally scoped to home court. */
export const singlesLadder = query({
    args: { courtId: v.optional(v.id("courts")) },
    handler: async (ctx, { courtId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        let ratings = await ctx.db.query("individualRatings").collect();

        if (courtId) {
            const courtUsers = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("selectedCourtId"), courtId))
                .collect();
            const ids = new Set(courtUsers.map((u) => u._id));
            ratings = ratings.filter((r) => ids.has(r.userId));
        }

        ratings.sort((a, b) => b.rating - a.rating);

        return await Promise.all(
            ratings.map(async (r, i) => {
                const user = await ctx.db.get(r.userId);
                return { ...r, rank: i + 1, user, isMe: r.userId === userId };
            })
        );
    },
});

/** Player match history. */
export const matchHistory = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const confirmed = await ctx.db
            .query("matches")
            .withIndex("by_status", (q) => q.eq("status", "confirmed"))
            .collect();

        const all = confirmed.filter(
            (m) =>
                m.p1Id === userId ||
                m.p2Id === userId ||
                m.p3Id === userId ||
                m.p4Id === userId
        );
        all.sort((a, b) => (b.confirmedAt ?? b.reportedAt) - (a.confirmedAt ?? a.reportedAt));

        return await Promise.all(
            all.map(async (m) => {
                const [p1, p2, p3, p4] = await Promise.all([
                    ctx.db.get(m.p1Id),
                    m.p2Id ? ctx.db.get(m.p2Id) : null,
                    ctx.db.get(m.p3Id),
                    m.p4Id ? ctx.db.get(m.p4Id) : null,
                ]);
                const isP1Side = m.p1Id === userId || m.p2Id === userId;
                const won = isP1Side ? m.score1 > m.score2 : m.score2 > m.score1;
                return { ...m, player1: p1, player2: p2, player3: p3, player4: p4, won };
            })
        );
    },
});

/** Mark debrief as done for the current user on a match. */
export const markDebriefDone = mutation({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const match = await ctx.db.get(matchId);
        if (!match) throw new Error("Match not found");

        const isP1Side = match.p1Id === userId || match.p2Id === userId;
        if (isP1Side) {
            await ctx.db.patch(matchId, { debriefTriggeredP1: true });
        } else {
            await ctx.db.patch(matchId, { debriefTriggeredP3: true });
        }
    },
});
