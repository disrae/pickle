import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sendExpoPush } from "./pushNotifications";

async function notifyCourtUsers(
    ctx: { db: any },
    courtId: string,
    excludeUserId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
) {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
        if (user._id === excludeUserId) continue;
        if (user.selectedCourtId !== courtId) continue;
        if (!user.expoPushToken) continue;
        await sendExpoPush(user.expoPushToken, title, body, data);
    }
}

export const create = mutation({
    args: {
        courtId: v.id("courts"),
        plannedTime: v.number(),
        notifyRegulars: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        if (args.plannedTime < Date.now()) {
            throw new Error("Cannot plan for past times");
        }

        const existing = await ctx.db
            .query("plannedVisits")
            .withIndex("by_time", (q) =>
                q.eq("courtId", args.courtId).eq("plannedTime", args.plannedTime)
            )
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        if (existing) {
            throw new Error("You already have a plan for this time");
        }

        const visitId = await ctx.db.insert("plannedVisits", {
            userId,
            courtId: args.courtId,
            plannedTime: args.plannedTime,
            createdAt: Date.now(),
        });

        const user = await ctx.db.get(userId);
        const court = await ctx.db.get(args.courtId);
        const userName = user?.name || user?.email || "Someone";
        const courtName = court?.name || "the court";

        const time = new Date(args.plannedTime);
        const timeStr = time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });

        // Notify subscribers to this user's plans
        const settings = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_subscribed_to", (q) => q.eq("subscribedToUserId", userId))
            .filter((q) => q.eq(q.field("notifyOnPlannedVisit"), true))
            .collect();

        for (const setting of settings) {
            const subscriber = await ctx.db.get(setting.userId);
            if (subscriber?.expoPushToken) {
                await sendExpoPush(
                    subscriber.expoPushToken,
                    `${userName} is planning to play`,
                    `${userName} is heading to ${courtName} at ${timeStr}`,
                    { type: "planned_visit", courtId: args.courtId }
                );
            }
        }

        if (args.notifyRegulars) {
            await notifyCourtUsers(
                ctx,
                args.courtId,
                userId,
                `${userName} is headed to ${courtName}`,
                `Planning to play at ${timeStr}. Who's in?`,
                { type: "headed_to_court", courtId: args.courtId }
            );
        }

        return visitId;
    },
});

/** Quick "I'm headed there" — plans for ~1 hour from now and pings court regulars */
export const headedToCourt = mutation({
    args: {
        courtId: v.id("courts"),
        plannedTime: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const plannedTime = args.plannedTime ?? Date.now() + 60 * 60 * 1000;

        const existing = await ctx.db
            .query("plannedVisits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("courtId"), args.courtId),
                    q.gte(q.field("plannedTime"), Date.now())
                )
            )
            .first();

        if (existing) {
            const user = await ctx.db.get(userId);
            const court = await ctx.db.get(args.courtId);
            const userName = user?.name || user?.email || "Someone";
            const courtName = court?.name || "the court";

            await notifyCourtUsers(
                ctx,
                args.courtId,
                userId,
                `${userName} is headed to ${courtName}`,
                "Who else is in?",
                { type: "headed_to_court", courtId: args.courtId }
            );
            return existing._id;
        }

        const visitId = await ctx.db.insert("plannedVisits", {
            userId,
            courtId: args.courtId,
            plannedTime,
            createdAt: Date.now(),
        });

        const user = await ctx.db.get(userId);
        const court = await ctx.db.get(args.courtId);
        const userName = user?.name || user?.email || "Someone";
        const courtName = court?.name || "the court";
        const timeStr = new Date(plannedTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });

        await notifyCourtUsers(
            ctx,
            args.courtId,
            userId,
            `${userName} is headed to ${courtName}`,
            `Planning to play around ${timeStr}. Who's in?`,
            { type: "headed_to_court", courtId: args.courtId }
        );

        return visitId;
    },
});

export const deleteVisit = mutation({
    args: {
        visitId: v.id("plannedVisits"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const visit = await ctx.db.get(args.visitId);
        if (!visit) {
            throw new Error("Visit not found");
        }

        if (visit.userId !== userId) {
            throw new Error("Not authorized to delete this visit");
        }

        await ctx.db.delete(args.visitId);
    },
});

export const getForCourt = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) return [];

        const now = Date.now();
        const visits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_time", (q) => q.eq("courtId", args.courtId))
            .filter((q) => q.gte(q.field("plannedTime"), now))
            .collect();

        // Fetch user details for each visit
        const visitsWithUsers = [];
        for (const visit of visits) {
            const user = await ctx.db.get(visit.userId);
            if (user) {
                // Check for blocking relationship
                const [blockedByMe, blockedByThem] = await Promise.all([
                    ctx.db
                        .query("blockedUsers")
                        .withIndex("by_user_and_blocked", (q) =>
                            q.eq("userId", currentUserId).eq("blockedUserId", visit.userId)
                        )
                        .first(),
                    ctx.db
                        .query("blockedUsers")
                        .withIndex("by_user_and_blocked", (q) =>
                            q.eq("userId", visit.userId).eq("blockedUserId", currentUserId)
                        )
                        .first(),
                ]);

                // Skip if there's any blocking relationship
                if (!blockedByMe && !blockedByThem) {
                    visitsWithUsers.push({
                        ...visit,
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                    });
                }
            }
        }

        // Sort by planned time
        visitsWithUsers.sort((a, b) => a.plannedTime - b.plannedTime);

        return visitsWithUsers;
    },
});

export const getCurrentUserPlans = query({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        const now = Date.now();
        const visits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("courtId"), args.courtId),
                    q.gte(q.field("plannedTime"), now)
                )
            )
            .collect();

        // Sort by planned time
        visits.sort((a, b) => a.plannedTime - b.plannedTime);

        return visits;
    },
});

