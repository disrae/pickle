import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all training chats
export const list = query({
    args: {},
    handler: async (ctx) => {
        const chats = await ctx.db
            .query("trainingChats")
            .withIndex("by_last_message")
            .order("desc")
            .collect();

        // Get participant counts and creator info for each chat
        const chatsWithDetails = await Promise.all(
            chats.map(async (chat) => {
                const participantCount = await ctx.db
                    .query("trainingChatParticipants")
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

// Get a single training chat by ID
export const get = query({
    args: { chatId: v.id("trainingChats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        const chat = await ctx.db.get(chatId);
        if (!chat) return null;

        const creator = await ctx.db.get(chat.createdBy);
        const participants = await ctx.db
            .query("trainingChatParticipants")
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

// Create a new training chat
export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, { title, description }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const now = Date.now();
        const chatId = await ctx.db.insert("trainingChats", {
            title,
            description,
            createdBy: userId,
            createdAt: now,
            lastMessageAt: now,
        });

        // Add creator as first participant
        await ctx.db.insert("trainingChatParticipants", {
            chatId,
            userId,
            joinedAt: now,
        });

        return chatId;
    },
});

// Add user to training chat
export const addParticipant = mutation({
    args: { chatId: v.id("trainingChats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Check if already a participant
        const existing = await ctx.db
            .query("trainingChatParticipants")
            .withIndex("by_chat_user", (q) =>
                q.eq("chatId", chatId).eq("userId", userId)
            )
            .first();

        if (existing) {
            return existing._id;
        }

        const participantId = await ctx.db.insert("trainingChatParticipants", {
            chatId,
            userId,
            joinedAt: Date.now(),
        });

        return participantId;
    },
});

// Search training chats
export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, { searchTerm }) => {
        const allChats = await ctx.db.query("trainingChats").collect();
        const searchLower = searchTerm.toLowerCase();

        // Filter chats based on search term
        const matchingChats = await Promise.all(
            allChats.map(async (chat) => {
                // Check title and description
                const titleMatch = chat.title.toLowerCase().includes(searchLower);
                const descriptionMatch =
                    chat.description?.toLowerCase().includes(searchLower) ?? false;

                // Check participant names
                const participants = await ctx.db
                    .query("trainingChatParticipants")
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
                        creator: creator
                            ? { name: creator.name, email: creator.email }
                            : null,
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

// Toggle training chat notification preference
export const toggleNotifications = mutation({
    args: { chatId: v.id("trainingChats") },
    handler: async (ctx, { chatId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Find the participant record
        const participant = await ctx.db
            .query("trainingChatParticipants")
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

