import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get notification settings for a target user
export const getNotificationSettings = query({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const settings = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_user_and_subscribed", (q) =>
                q.eq("userId", userId).eq("subscribedToUserId", targetUserId)
            )
            .first();

        return settings || {
            notifyOnCheckIn: false,
            notifyOnPlannedVisit: false,
        };
    },
});

// Toggle check-in notification subscription
export const toggleCheckInNotification = mutation({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_user_and_subscribed", (q) =>
                q.eq("userId", userId).eq("subscribedToUserId", targetUserId)
            )
            .first();

        if (existing) {
            // Toggle the setting
            await ctx.db.patch(existing._id, {
                notifyOnCheckIn: !existing.notifyOnCheckIn,
            });
        } else {
            // Create new settings with check-in enabled
            await ctx.db.insert("userNotificationSettings", {
                userId,
                subscribedToUserId: targetUserId,
                notifyOnCheckIn: true,
                notifyOnPlannedVisit: false,
                createdAt: Date.now(),
            });
        }
    },
});

// Toggle planned visit notification subscription
export const togglePlannedVisitNotification = mutation({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_user_and_subscribed", (q) =>
                q.eq("userId", userId).eq("subscribedToUserId", targetUserId)
            )
            .first();

        if (existing) {
            // Toggle the setting
            await ctx.db.patch(existing._id, {
                notifyOnPlannedVisit: !existing.notifyOnPlannedVisit,
            });
        } else {
            // Create new settings with planned visit enabled
            await ctx.db.insert("userNotificationSettings", {
                userId,
                subscribedToUserId: targetUserId,
                notifyOnCheckIn: false,
                notifyOnPlannedVisit: true,
                createdAt: Date.now(),
            });
        }
    },
});

// Get all users subscribed to check-ins for a specific user
export const getUsersSubscribedToCheckIns = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const settings = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_subscribed_to", (q) => q.eq("subscribedToUserId", userId))
            .filter((q) => q.eq(q.field("notifyOnCheckIn"), true))
            .collect();

        // Get user details for each subscriber
        const subscribers = await Promise.all(
            settings.map(async (setting) => {
                const user = await ctx.db.get(setting.userId);
                return user;
            })
        );

        return subscribers.filter((user) => user !== null);
    },
});

// Get all users subscribed to planned visits for a specific user
export const getUsersSubscribedToPlannedVisits = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const settings = await ctx.db
            .query("userNotificationSettings")
            .withIndex("by_subscribed_to", (q) => q.eq("subscribedToUserId", userId))
            .filter((q) => q.eq(q.field("notifyOnPlannedVisit"), true))
            .collect();

        // Get user details for each subscriber
        const subscribers = await Promise.all(
            settings.map(async (setting) => {
                const user = await ctx.db.get(setting.userId);
                return user;
            })
        );

        return subscribers.filter((user) => user !== null);
    },
});

