import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sendExpoPush } from "./pushNotifications";

const DEFAULT_RATING = 1000;

/** All teams the current user is a member of. */
export const myTeams = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const [asP1, asP2] = await Promise.all([
            ctx.db.query("teams").withIndex("by_player1", (q) => q.eq("player1Id", userId)).collect(),
            ctx.db.query("teams").withIndex("by_player2", (q) => q.eq("player2Id", userId)).collect(),
        ]);

        const teams = [...asP1, ...asP2];

        return await Promise.all(
            teams.map(async (team) => {
                const partnerId = team.player1Id === userId ? team.player2Id : team.player1Id;
                const partner = await ctx.db.get(partnerId);
                return { ...team, partner };
            })
        );
    },
});

/** All teams at a given court (by home-court membership of either player), sorted by rating desc. */
export const teamsByRating = query({
    args: { courtId: v.optional(v.id("courts")) },
    handler: async (ctx, { courtId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        let teams;
        if (courtId) {
            // Players whose home court matches courtId
            const courtUsers = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("selectedCourtId"), courtId))
                .collect();
            const courtUserIds = new Set(courtUsers.map((u) => u._id));

            const allTeams = await ctx.db.query("teams").collect();
            teams = allTeams.filter(
                (t) => courtUserIds.has(t.player1Id) || courtUserIds.has(t.player2Id)
            );
        } else {
            teams = await ctx.db.query("teams").collect();
        }

        teams.sort((a, b) => b.rating - a.rating);

        return await Promise.all(
            teams.map(async (team, i) => {
                const [p1, p2] = await Promise.all([ctx.db.get(team.player1Id), ctx.db.get(team.player2Id)]);
                return { ...team, rank: i + 1, player1: p1, player2: p2 };
            })
        );
    },
});

/** Invite a partner to form a team. */
export const invitePartner = mutation({
    args: {
        inviteeId: v.id("users"),
        teamName: v.string(),
    },
    handler: async (ctx, { inviteeId, teamName }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        if (userId === inviteeId) throw new Error("Cannot invite yourself");

        // Check for duplicate pending invite
        const existing = await ctx.db
            .query("teamInvites")
            .withIndex("by_inviter", (q) => q.eq("inviterId", userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("inviteeId"), inviteeId),
                    q.eq(q.field("status"), "pending")
                )
            )
            .first();
        if (existing) throw new Error("Invite already pending");

        await ctx.db.insert("teamInvites", {
            teamName,
            inviterId: userId,
            inviteeId,
            status: "pending",
            createdAt: Date.now(),
        });

        // Push notify invitee
        const [inviter, invitee] = await Promise.all([ctx.db.get(userId), ctx.db.get(inviteeId)]);
        if (invitee?.expoPushToken) {
            await sendExpoPush(
                invitee.expoPushToken,
                "Team invite 🏓",
                `${inviter?.name ?? "Someone"} wants to team up as "${teamName}"`
            );
        }
    },
});

/** Accept a pending team invite — creates the team. */
export const acceptInvite = mutation({
    args: { inviteId: v.id("teamInvites") },
    handler: async (ctx, { inviteId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db.get(inviteId);
        if (!invite) throw new Error("Invite not found");
        if (invite.inviteeId !== userId) throw new Error("Not your invite");
        if (invite.status !== "pending") throw new Error("Invite already resolved");

        // Seed rating from avg of individual ratings
        const [r1, r2] = await Promise.all([
            ctx.db.query("individualRatings").withIndex("by_user", (q) => q.eq("userId", invite.inviterId)).first(),
            ctx.db.query("individualRatings").withIndex("by_user", (q) => q.eq("userId", userId)).first(),
        ]);
        const seedRating = Math.round(
            ((r1?.rating ?? DEFAULT_RATING) + (r2?.rating ?? DEFAULT_RATING)) / 2
        );

        const teamId = await ctx.db.insert("teams", {
            name: invite.teamName,
            player1Id: invite.inviterId,
            player2Id: userId,
            rating: seedRating,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            createdAt: Date.now(),
        });

        await ctx.db.patch(inviteId, { status: "accepted" });

        // Notify inviter
        const inviter = await ctx.db.get(invite.inviterId);
        if (inviter?.expoPushToken) {
            const me = await ctx.db.get(userId);
            await sendExpoPush(
                inviter.expoPushToken,
                "Team formed! 🎉",
                `${me?.name ?? "Your partner"} accepted — "${invite.teamName}" is ready to play`
            );
        }

        return teamId;
    },
});

/** Decline a pending invite. */
export const declineInvite = mutation({
    args: { inviteId: v.id("teamInvites") },
    handler: async (ctx, { inviteId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db.get(inviteId);
        if (!invite) throw new Error("Invite not found");
        if (invite.inviteeId !== userId) throw new Error("Not your invite");

        await ctx.db.patch(inviteId, { status: "declined" });
    },
});

/** Pending invites sent to the current user. */
export const pendingInvites = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const invites = await ctx.db
            .query("teamInvites")
            .withIndex("by_invitee", (q) => q.eq("inviteeId", userId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        return await Promise.all(
            invites.map(async (invite) => {
                const inviter = await ctx.db.get(invite.inviterId);
                return { ...invite, inviter };
            })
        );
    },
});

/** Rename your team (either member can do this). */
export const renameTeam = mutation({
    args: { teamId: v.id("teams"), name: v.string() },
    handler: async (ctx, { teamId, name }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const team = await ctx.db.get(teamId);
        if (!team) throw new Error("Team not found");
        if (team.player1Id !== userId && team.player2Id !== userId) {
            throw new Error("Not a member of this team");
        }

        await ctx.db.patch(teamId, { name });
    },
});
