import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all messages for a chat
export const getMessagesForChat = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, { chatId }) => {
        const messages = await ctx.db
            .query("chatMessages")
            .withIndex("by_created", (q) => q.eq("chatId", chatId))
            .order("asc")
            .collect();

        // Get user details for each message
        const messagesWithUsers = await Promise.all(
            messages.map(async (message) => {
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

        return messagesWithUsers;
    },
});

// Send a message
export const sendMessage = mutation({
    args: {
        chatId: v.id("chats"),
        message: v.string(),
    },
    handler: async (ctx, { chatId, message }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const now = Date.now();

        // Insert the message
        const messageId = await ctx.db.insert("chatMessages", {
            chatId,
            userId,
            message,
            createdAt: now,
        });

        // Update chat's lastMessageAt
        const chat = await ctx.db.get(chatId);
        if (chat) {
            await ctx.db.patch(chatId, {
                lastMessageAt: now,
            });
        }

        // Add user as participant if not already
        const existingParticipant = await ctx.db
            .query("chatParticipants")
            .withIndex("by_chat_user", (q) => q.eq("chatId", chatId).eq("userId", userId))
            .first();

        if (!existingParticipant) {
            await ctx.db.insert("chatParticipants", {
                chatId,
                userId,
                joinedAt: now,
            });
        }

        return messageId;
    },
});

// Delete a message (admin only)
export const deleteMessage = mutation({
    args: { messageId: v.id("chatMessages") },
    handler: async (ctx, { messageId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        if (!user?.isAdmin) {
            throw new Error("Only admins can delete messages");
        }

        await ctx.db.delete(messageId);
    },
});

