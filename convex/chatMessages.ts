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

        // Send notifications to participants who have enabled notifications
        const sender = await ctx.db.get(userId);
        const senderName = sender?.name || sender?.email || "Someone";
        
        const participants = await ctx.db
            .query("chatParticipants")
            .withIndex("by_chat", (q) => q.eq("chatId", chatId))
            .collect();

        for (const participant of participants) {
            // Skip the sender
            if (participant.userId === userId) continue;
            
            // Only notify if they have enabled notifications
            if (participant.notifyOnNewMessage) {
                const user = await ctx.db.get(participant.userId);
                if (user?.expoPushToken) {
                    // Send notification using Expo push API
                    try {
                        await fetch("https://exp.host/--/api/v2/push/send", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                to: user.expoPushToken,
                                sound: "default",
                                title: chat?.title || "New message",
                                body: `${senderName}: ${message.slice(0, 100)}${message.length > 100 ? "..." : ""}`,
                                data: { chatId, type: "court_chat" },
                            }),
                        });
                    } catch (error) {
                        console.error("Error sending push notification:", error);
                    }
                }
            }
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

