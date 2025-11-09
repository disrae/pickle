import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Block a user
export const blockUser = mutation({
    args: { blockedUserId: v.id("users") },
    handler: async (ctx, { blockedUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Check if already blocked
        const existing = await ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q) =>
                q.eq("userId", userId).eq("blockedUserId", blockedUserId)
            )
            .first();

        if (existing) {
            // Already blocked
            return;
        }

        // Create block record
        await ctx.db.insert("blockedUsers", {
            userId,
            blockedUserId,
            createdAt: Date.now(),
        });
    },
});

// Unblock a user
export const unblockUser = mutation({
    args: { blockedUserId: v.id("users") },
    handler: async (ctx, { blockedUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q) =>
                q.eq("userId", userId).eq("blockedUserId", blockedUserId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

// Check if current user has blocked target user
export const isBlocked = query({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const blocked = await ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q) =>
                q.eq("userId", userId).eq("blockedUserId", targetUserId)
            )
            .first();

        return !!blocked;
    },
});

// Check if current user is blocked by target user
export const isBlockedBy = query({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const blocked = await ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q) =>
                q.eq("userId", targetUserId).eq("blockedUserId", userId)
            )
            .first();

        return !!blocked;
    },
});

// Get block status in both directions
export const getUserBlockStatus = query({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return {
                isBlocked: false,
                isBlockedBy: false,
            };
        }

        const [blockedByMe, blockedByThem] = await Promise.all([
            ctx.db
                .query("blockedUsers")
                .withIndex("by_user_and_blocked", (q) =>
                    q.eq("userId", userId).eq("blockedUserId", targetUserId)
                )
                .first(),
            ctx.db
                .query("blockedUsers")
                .withIndex("by_user_and_blocked", (q) =>
                    q.eq("userId", targetUserId).eq("blockedUserId", userId)
                )
                .first(),
        ]);

        return {
            isBlocked: !!blockedByMe,
            isBlockedBy: !!blockedByThem,
        };
    },
});

// Helper function to check if two users have any block relationship
export const hasBlockRelationship = async (
    ctx: any,
    userId1: string,
    userId2: string
): Promise<boolean> => {
    const [blocked1, blocked2] = await Promise.all([
        ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q: any) =>
                q.eq("userId", userId1).eq("blockedUserId", userId2)
            )
            .first(),
        ctx.db
            .query("blockedUsers")
            .withIndex("by_user_and_blocked", (q: any) =>
                q.eq("userId", userId2).eq("blockedUserId", userId1)
            )
            .first(),
    ]);

    return !!(blocked1 || blocked2);
};

