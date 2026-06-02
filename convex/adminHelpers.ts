import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Make the current user an admin
export const makeCurrentUserAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        await ctx.db.patch(userId, {
            isAdmin: true,
        });

        return { success: true, message: "You are now an admin!" };
    },
});

// Make a user admin by userId
export const makeUserAdmin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(userId, {
            isAdmin: true,
        });

        return {
            success: true,
            message: `User ${user.name || user.email} is now an admin!`,
        };
    },
});

// Make a specific user an admin by email
export const makeUserAdminByEmail = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .first();

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        await ctx.db.patch(user._id, {
            isAdmin: true,
        });

        return {
            success: true,
            message: `User ${user.name || user.email} is now an admin!`,
        };
    },
});

// Check if current user is admin
export const isCurrentUserAdmin = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const user = await ctx.db.get(userId);
        return user?.isAdmin ?? false;
    },
});

// List all admin users
export const listAdmins = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const admins = users.filter((user) => user.isAdmin);

        return admins.map((admin) => ({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
        }));
    },
});

/** Seed local/dev data to test ladder + post-match coach flows. */
export const seedDevLeagueData = mutation({
    args: { confirm: v.string(), targetUserId: v.optional(v.id("users")) },
    handler: async (ctx, { confirm, targetUserId }) => {
        if (confirm !== "SEED_DEV_DATA") {
            throw new Error('Pass confirm: "SEED_DEV_DATA"');
        }

        const authUserId = await getAuthUserId(ctx);
        let meId = targetUserId ?? authUserId;
        if (!meId) {
            const allUsers = await ctx.db.query("users").collect();
            const preferred = allUsers.find((u) => u.email && !u.email.includes("dev+"));
            meId = preferred?._id ?? allUsers[0]?._id;
        }
        if (!meId) throw new Error("No users found. Create/login one user first.");

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        const me = await ctx.db.get(meId);
        const myName = me?.name?.trim() || "You";

        // Reuse a deterministic dev court if it exists.
        const allCourts = await ctx.db.query("courts").collect();
        const existingCourt = allCourts.find((c) => c.name === "Sunset Dev Courts");
        let courtId = existingCourt?._id;
        if (!courtId) {
            courtId = await ctx.db.insert("courts", {
                name: "Sunset Dev Courts",
                location: { lat: 33.6846, lng: -117.8265 },
                notes: "Seeded dev court",
            });
        }

        await ctx.db.patch(meId, {
            selectedCourtId: courtId,
            appearAtCourt: true,
        });

        const fakePlayers = [
            { name: "Avery Park", email: "dev+avery@pickle.local", rating: 1042 },
            { name: "Jordan Lee", email: "dev+jordan@pickle.local", rating: 1018 },
            { name: "Casey Kim", email: "dev+casey@pickle.local", rating: 996 },
            { name: "Riley Chen", email: "dev+riley@pickle.local", rating: 980 },
            { name: "Morgan Diaz", email: "dev+morgan@pickle.local", rating: 965 },
        ] as const;

        const seededUserIds: string[] = [];
        for (const player of fakePlayers) {
            const existing = await ctx.db
                .query("users")
                .withIndex("email", (q) => q.eq("email", player.email))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    name: player.name,
                    selectedCourtId: courtId,
                    appearAtCourt: true,
                });
                seededUserIds.push(existing._id);
            } else {
                const newId = await ctx.db.insert("users", {
                    name: player.name,
                    email: player.email,
                    selectedCourtId: courtId,
                    appearAtCourt: true,
                    coachOnboardingComplete: true,
                });
                seededUserIds.push(newId);
            }
        }

        const ensureIndividualRating = async (
            userId: string,
            rating: number,
            matchesPlayed: number,
            wins: number,
            losses: number
        ) => {
            const existing = await ctx.db
                .query("individualRatings")
                .withIndex("by_user", (q) => q.eq("userId", userId as any))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating,
                    matchesPlayed,
                    wins,
                    losses,
                    updatedAt: now,
                });
            } else {
                await ctx.db.insert("individualRatings", {
                    userId: userId as any,
                    rating,
                    matchesPlayed,
                    wins,
                    losses,
                    updatedAt: now,
                });
            }
        };

        await ensureIndividualRating(meId, 1030, 8, 5, 3);
        for (let i = 0; i < fakePlayers.length; i++) {
            const p = fakePlayers[i];
            const uid = seededUserIds[i];
            await ensureIndividualRating(uid, p.rating, 10 + i, 5 + (i % 3), 5 + ((i + 1) % 3));
        }

        const allTeams = await ctx.db.query("teams").collect();
        const ensureTeam = async (name: string, a: string, b: string, rating: number) => {
            const existing = allTeams.find(
                (t) =>
                    (t.player1Id === a && t.player2Id === b) ||
                    (t.player1Id === b && t.player2Id === a)
            );
            if (existing) {
                await ctx.db.patch(existing._id, {
                    name,
                    rating,
                    matchesPlayed: Math.max(existing.matchesPlayed, 3),
                    wins: Math.max(existing.wins, 2),
                    losses: Math.max(existing.losses, 1),
                });
                return existing._id;
            }
            return await ctx.db.insert("teams", {
                name,
                player1Id: a as any,
                player2Id: b as any,
                rating,
                matchesPlayed: 3,
                wins: 2,
                losses: 1,
                createdAt: now,
            });
        };

        const myPartnerId = seededUserIds[0];
        const opp1Id = seededUserIds[1];
        const opp2Id = seededUserIds[2];
        const myTeamId = await ensureTeam(`${myName} & Avery`, meId, myPartnerId, 1036);
        const rivalTeamId = await ensureTeam("Jordan & Casey", opp1Id, opp2Id, 1012);

        const courtMatches = await ctx.db
            .query("matches")
            .withIndex("by_court", (q) => q.eq("courtId", courtId))
            .collect();

        const alreadySeededDoubles = courtMatches.some(
            (m) =>
                m.format === "doubles" &&
                m.team1Id === myTeamId &&
                m.team2Id === rivalTeamId &&
                m.score1 === 11 &&
                m.score2 === 8 &&
                m.status === "confirmed"
        );
        const alreadySeededSingles = courtMatches.some(
            (m) =>
                m.format === "singles" &&
                m.p1Id === meId &&
                m.p3Id === opp1Id &&
                m.score1 === 7 &&
                m.score2 === 11 &&
                m.status === "confirmed"
        );

        let createdMatches = 0;
        if (!alreadySeededDoubles) {
            await ctx.db.insert("matches", {
                format: "doubles",
                courtId,
                team1Id: myTeamId as any,
                team2Id: rivalTeamId as any,
                p1Id: meId,
                p2Id: myPartnerId as any,
                p3Id: opp1Id as any,
                p4Id: opp2Id as any,
                score1: 11,
                score2: 8,
                reportedBy: meId,
                reportedAt: now - oneDay,
                confirmedBy: opp1Id as any,
                confirmedAt: now - oneDay + 60_000,
                status: "confirmed",
                debriefTriggeredP1: false,
                debriefTriggeredP3: false,
                createdAt: now - oneDay,
            });
            createdMatches++;
        }

        if (!alreadySeededSingles) {
            await ctx.db.insert("matches", {
                format: "singles",
                courtId,
                p1Id: meId,
                p3Id: opp1Id as any,
                score1: 7,
                score2: 11,
                reportedBy: opp1Id as any,
                reportedAt: now - 2 * oneDay,
                confirmedBy: meId,
                confirmedAt: now - 2 * oneDay + 60_000,
                status: "confirmed",
                debriefTriggeredP1: false,
                debriefTriggeredP3: true,
                createdAt: now - 2 * oneDay,
            });
            createdMatches++;
        }

        return {
            ok: true,
            courtId,
            seededUsers: seededUserIds.length,
            createdMatches,
            notes: "Debrief should now appear for your side on seeded confirmed matches.",
        };
    },
});

/** Seed public browse teams for every court (dev helper). */
export const seedTeamsForAllCourtsDev = mutation({
    args: { confirm: v.string() },
    handler: async (ctx, { confirm }) => {
        if (confirm !== "SEED_TEAMS_ALL_COURTS") {
            throw new Error('Pass confirm: "SEED_TEAMS_ALL_COURTS"');
        }

        const now = Date.now();
        const courts = await ctx.db.query("courts").collect();
        if (courts.length === 0) throw new Error("No courts found. Seed courts first.");

        const ensureRating = async (userId: string, rating: number) => {
            const existing = await ctx.db
                .query("individualRatings")
                .withIndex("by_user", (q) => q.eq("userId", userId as any))
                .first();
            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating,
                    matchesPlayed: Math.max(existing.matchesPlayed, 6),
                    wins: Math.max(existing.wins, 3),
                    losses: Math.max(existing.losses, 2),
                    updatedAt: now,
                });
            } else {
                await ctx.db.insert("individualRatings", {
                    userId: userId as any,
                    rating,
                    matchesPlayed: 6,
                    wins: 3,
                    losses: 3,
                    updatedAt: now,
                });
            }
        };

        let createdTeams = 0;
        let touchedUsers = 0;

        for (const court of courts) {
            const slug = court.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const base = [
                { name: `${court.name} Alpha`, email: `dev+${slug}-alpha@pickle.local`, rating: 1040 },
                { name: `${court.name} Bravo`, email: `dev+${slug}-bravo@pickle.local`, rating: 1020 },
                { name: `${court.name} Charlie`, email: `dev+${slug}-charlie@pickle.local`, rating: 1000 },
                { name: `${court.name} Delta`, email: `dev+${slug}-delta@pickle.local`, rating: 980 },
            ] as const;

            const userIds: string[] = [];
            for (const p of base) {
                const existing = await ctx.db
                    .query("users")
                    .withIndex("email", (q) => q.eq("email", p.email))
                    .first();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        name: p.name,
                        selectedCourtId: court._id,
                        appearAtCourt: true,
                    });
                    userIds.push(existing._id);
                } else {
                    const userId = await ctx.db.insert("users", {
                        name: p.name,
                        email: p.email,
                        selectedCourtId: court._id,
                        appearAtCourt: true,
                        coachOnboardingComplete: true,
                    });
                    userIds.push(userId);
                }

                await ensureRating(userIds[userIds.length - 1], p.rating);
                touchedUsers++;
            }

            const allTeams = await ctx.db.query("teams").collect();
            const ensureTeam = async (name: string, p1: string, p2: string, rating: number) => {
                const existing = allTeams.find(
                    (t) =>
                        (t.player1Id === p1 && t.player2Id === p2) ||
                        (t.player1Id === p2 && t.player2Id === p1)
                );
                if (existing) {
                    await ctx.db.patch(existing._id, {
                        name,
                        rating,
                        matchesPlayed: Math.max(existing.matchesPlayed, 5),
                        wins: Math.max(existing.wins, 3),
                        losses: Math.max(existing.losses, 2),
                    });
                    return;
                }

                await ctx.db.insert("teams", {
                    name,
                    player1Id: p1 as any,
                    player2Id: p2 as any,
                    rating,
                    matchesPlayed: 5,
                    wins: 3,
                    losses: 2,
                    createdAt: now,
                });
                createdTeams++;
            };

            await ensureTeam(`${court.name} A-Team`, userIds[0], userIds[1], 1030);
            await ensureTeam(`${court.name} Smash Bros`, userIds[2], userIds[3], 990);
        }

        return {
            ok: true,
            courts: courts.length,
            touchedUsers,
            createdTeams,
        };
    },
});

