import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all chats for a specific court
export const getChatsForCourt = query({
    args: { courtId: v.id("courts") },
    handler: async (ctx, { courtId }) => {
        const chats = await ctx.db
            .query("chats")
            .withIndex("by_last_message", (q) => q.eq("courtId", courtId))
            .order("desc")
            .collect();

        // Get participant counts and creator info for each chat
        const chatsWithDetails = await Promise.all(
            chats.map(async (chat) => {
                const participantCount = await ctx.db
                    .query("chatParticipants")
                    .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
                    .collect()
                    .then((participants) => participants.length);

                const creator = await ctx.db.get(chat.createdBy);

                return {
                    ...chat,
                    participantCount,
                    creator: creator ? { name: creator.name, email: creator.email } : null,
                };
            })
        );

        return chatsWithDetails;
    },
});

// Get a single chat by ID
export const getChatById = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        const chat = await ctx.db.get(chatId);
        if (!chat) return null;

        const creator = await ctx.db.get(chat.createdBy);
        const participants = await ctx.db
            .query("chatParticipants")
            .withIndex("by_chat", (q) => q.eq("chatId", chatId))
            .collect();

        const participantDetails = await Promise.all(
            participants.map(async (p) => {
                const user = await ctx.db.get(p.userId);
                return {
                    userId: p.userId,
                    name: user?.name,
                    email: user?.email,
                    joinedAt: p.joinedAt,
                };
            })
        );

        // Get current user's notification preference
        let notifyOnNewMessage = false;
        if (userId) {
            const currentUserParticipant = participants.find((p) => p.userId === userId);
            notifyOnNewMessage = currentUserParticipant?.notifyOnNewMessage ?? false;
        }

        return {
            ...chat,
            creator: creator ? { name: creator.name, email: creator.email } : null,
            participants: participantDetails,
            notifyOnNewMessage,
        };
    },
});

// Create a new chat
export const createChat = mutation({
    args: {
        courtId: v.id("courts"),
        title: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, { courtId, title, description }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const now = Date.now();
        const chatId = await ctx.db.insert("chats", {
            courtId,
            title,
            description,
            createdBy: userId,
            createdAt: now,
            lastMessageAt: now,
        });

        // Add creator as first participant
        await ctx.db.insert("chatParticipants", {
            chatId,
            userId,
            joinedAt: now,
        });

        return chatId;
    },
});

// Delete a chat (admin only)
export const deleteChat = mutation({
    args: { chatId: v.id("chats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        if (!user?.isAdmin) {
            throw new Error("Only admins can delete chats");
        }

        // Delete all messages
        const messages = await ctx.db
            .query("chatMessages")
            .withIndex("by_chat", (q) => q.eq("chatId", chatId))
            .collect();
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // Delete all participants
        const participants = await ctx.db
            .query("chatParticipants")
            .withIndex("by_chat", (q) => q.eq("chatId", chatId))
            .collect();
        for (const participant of participants) {
            await ctx.db.delete(participant._id);
        }

        // Delete the chat
        await ctx.db.delete(chatId);
    },
});

// Search chats by title, description, or participant names
export const searchChats = query({
    args: {
        courtId: v.id("courts"),
        searchTerm: v.string(),
    },
    handler: async (ctx, { courtId, searchTerm }) => {
        const allChats = await ctx.db
            .query("chats")
            .withIndex("by_court", (q) => q.eq("courtId", courtId))
            .collect();

        const searchLower = searchTerm.toLowerCase();

        // Filter chats based on search term
        const matchingChats = await Promise.all(
            allChats.map(async (chat) => {
                // Check title and description
                const titleMatch = chat.title.toLowerCase().includes(searchLower);
                const descriptionMatch = chat.description?.toLowerCase().includes(searchLower) ?? false;

                // Check participant names
                const participants = await ctx.db
                    .query("chatParticipants")
                    .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
                    .collect();

                let participantMatch = false;
                for (const participant of participants) {
                    const user = await ctx.db.get(participant.userId);
                    if (
                        user?.name?.toLowerCase().includes(searchLower) ||
                        user?.email?.toLowerCase().includes(searchLower)
                    ) {
                        participantMatch = true;
                        break;
                    }
                }

                if (titleMatch || descriptionMatch || participantMatch) {
                    const participantCount = participants.length;
                    const creator = await ctx.db.get(chat.createdBy);
                    return {
                        ...chat,
                        participantCount,
                        creator: creator ? { name: creator.name, email: creator.email } : null,
                    };
                }
                return null;
            })
        );

        // Filter out nulls and sort by last message
        return matchingChats
            .filter((chat) => chat !== null)
            .sort((a, b) => (b!.lastMessageAt ?? 0) - (a!.lastMessageAt ?? 0));
    },
});

// Toggle chat notification preference
export const toggleChatNotifications = mutation({
    args: { chatId: v.id("chats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Find the participant record
        const participant = await ctx.db
            .query("chatParticipants")
            .withIndex("by_chat_user", (q) =>
                q.eq("chatId", chatId).eq("userId", userId)
            )
            .first();

        if (!participant) {
            throw new Error("User is not a participant in this chat");
        }

        // Toggle the notification preference
        await ctx.db.patch(participant._id, {
            notifyOnNewMessage: !participant.notifyOnNewMessage,
        });

        return !participant.notifyOnNewMessage;
    },
});

