import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get messages for a builder chat
export const list = query({
    args: { chatId: v.id("builderChats") },
    handler: async (ctx, { chatId }) => {
        const messages = await ctx.db
            .query("builderChatMessages")
            .withIndex("by_created", (q) => q.eq("chatId", chatId))
            .order("asc")
            .collect();

        // Get user info for each message
        const messagesWithUser = await Promise.all(
            messages.map(async (message) => {
                const user = await ctx.db.get(message.userId);
                return {
                    ...message,
                    user: user
                        ? {
                              name: user.name,
                              email: user.email,
                              image: user.image,
                          }
                        : null,
                };
            })
        );

        return messagesWithUser;
    },
});

// Send a message in a builder chat
export const send = mutation({
    args: {
        chatId: v.id("builderChats"),
        message: v.string(),
    },
    handler: async (ctx, { chatId, message }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const now = Date.now();

        // Add user as participant if not already
        const existingParticipant = await ctx.db
            .query("builderChatParticipants")
            .withIndex("by_chat_user", (q) =>
                q.eq("chatId", chatId).eq("userId", userId)
            )
            .first();

        if (!existingParticipant) {
            await ctx.db.insert("builderChatParticipants", {
                chatId,
                userId,
                joinedAt: now,
            });
        }

        // Insert the message
        const messageId = await ctx.db.insert("builderChatMessages", {
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

        return messageId;
    },
});

