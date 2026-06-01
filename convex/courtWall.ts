import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const WALL_TTL_MS = 48 * 60 * 60 * 1000;
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_WALL_MESSAGE_LENGTH = 280;

function assertMessageLength(message: string) {
    const trimmed = message.trim();
    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }
    if (trimmed.length > MAX_WALL_MESSAGE_LENGTH) {
        throw new Error(`Message must be ${MAX_WALL_MESSAGE_LENGTH} characters or less`);
    }
    return trimmed;
}

export const getMessagesForCourt = query({
    args: { courtId: v.id("courts") },
    handler: async (ctx, { courtId }) => {
        const now = Date.now();
        const messages = await ctx.db
            .query("courtWallMessages")
            .withIndex("by_court_created", (q) => q.eq("courtId", courtId))
            .order("asc")
            .collect();

        const active = messages.filter((m) => m.expiresAt > now);

        return Promise.all(
            active.map(async (message) => {
                const user = await ctx.db.get(message.userId);
                return {
                    ...message,
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
    },
});

export const postMessage = mutation({
    args: {
        courtId: v.id("courts"),
        message: v.string(),
    },
    handler: async (ctx, { courtId, message }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const court = await ctx.db.get(courtId);
        if (!court) {
            throw new Error("Court not found");
        }

        const trimmed = assertMessageLength(message);
        const now = Date.now();

        return await ctx.db.insert("courtWallMessages", {
            courtId,
            userId,
            message: trimmed,
            createdAt: now,
            expiresAt: now + WALL_TTL_MS,
        });
    },
});

export const editMessage = mutation({
    args: {
        messageId: v.id("courtWallMessages"),
        message: v.string(),
    },
    handler: async (ctx, { messageId, message }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db.get(messageId);
        if (!existing) {
            throw new Error("Message not found");
        }
        if (existing.userId !== userId) {
            throw new Error("You can only edit your own posts");
        }

        const now = Date.now();
        if (existing.expiresAt <= now) {
            throw new Error("Message has expired");
        }
        if (now - existing.createdAt > EDIT_WINDOW_MS) {
            throw new Error("Edit window has closed");
        }

        const trimmed = assertMessageLength(message);
        await ctx.db.patch(messageId, {
            message: trimmed,
            editedAt: now,
        });
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("courtWallMessages") },
    handler: async (ctx, { messageId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db.get(messageId);
        if (!existing) {
            throw new Error("Message not found");
        }
        if (existing.userId !== userId) {
            throw new Error("You can only delete your own posts");
        }
        if (existing.expiresAt <= Date.now()) {
            throw new Error("Message has expired");
        }

        await ctx.db.delete(messageId);
    },
});

export const cleanupExpired = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expired = await ctx.db
            .query("courtWallMessages")
            .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
            .collect();

        for (const message of expired) {
            await ctx.db.delete(message._id);
        }

        return { deletedCount: expired.length };
    },
});
