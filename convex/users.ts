import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;

        return await ctx.db.get(userId);
    },
});

export const updateSelectedCourt = mutation({
    args: {
        courtId: v.id("courts"),
    },
    handler: async (ctx, { courtId }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        await ctx.db.patch(userId, {
            selectedCourtId: courtId,
        });
    },
});

export const updateName = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, { name }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        const trimmedName = name.trim();

        // Validate name
        if (trimmedName.length < 2) {
            throw new Error("Name must be at least 2 characters");
        }

        if (!/[a-zA-Z]/.test(trimmedName)) {
            throw new Error("Name must contain at least one letter");
        }

        await ctx.db.patch(userId, {
            name: trimmedName,
        });
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        return await ctx.storage.generateUploadUrl();
    },
});

export const saveProfileImage = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, { storageId }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        // Get current user to check for existing image
        const user = await ctx.db.get(userId);
        
        // Delete old profile image if it exists
        if (user?.image) {
            await ctx.storage.delete(user.image);
        }

        // Save new image
        await ctx.db.patch(userId, {
            image: storageId,
        });
    },
});

export const getProfileImageUrl = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;

        const user = await ctx.db.get(userId);
        if (!user?.image) return null;

        return await ctx.storage.getUrl(user.image);
    },
});

export const deleteAccount = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        // Delete user's profile image if it exists
        const user = await ctx.db.get(userId);
        if (user?.image) {
            await ctx.storage.delete(user.image);
        }

        // Delete all user-related data across tables
        
        // Delete check-ins
        const checkIns = await ctx.db
            .query("checkIns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const checkIn of checkIns) {
            await ctx.db.delete(checkIn._id);
        }

        // Delete planned visits
        const plannedVisits = await ctx.db
            .query("plannedVisits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const visit of plannedVisits) {
            await ctx.db.delete(visit._id);
        }

        // Delete chat messages
        const chatMessages = await ctx.db
            .query("chatMessages")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        for (const message of chatMessages) {
            await ctx.db.delete(message._id);
        }

        // Delete chat participants
        const chatParticipants = await ctx.db
            .query("chatParticipants")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const participant of chatParticipants) {
            await ctx.db.delete(participant._id);
        }

        // Delete training chat messages
        const trainingChatMessages = await ctx.db
            .query("trainingChatMessages")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        for (const message of trainingChatMessages) {
            await ctx.db.delete(message._id);
        }

        // Delete training chat participants
        const trainingChatParticipants = await ctx.db
            .query("trainingChatParticipants")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const participant of trainingChatParticipants) {
            await ctx.db.delete(participant._id);
        }

        // Delete builder chat messages
        const builderChatMessages = await ctx.db
            .query("builderChatMessages")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        for (const message of builderChatMessages) {
            await ctx.db.delete(message._id);
        }

        // Delete builder chat participants
        const builderChatParticipants = await ctx.db
            .query("builderChatParticipants")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const participant of builderChatParticipants) {
            await ctx.db.delete(participant._id);
        }

        // Delete drill progress
        const drillProgress = await ctx.db
            .query("drillProgress")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const progress of drillProgress) {
            await ctx.db.delete(progress._id);
        }

        // Delete user-created drills
        const drills = await ctx.db
            .query("drills")
            .withIndex("by_creator", (q) => q.eq("createdBy", userId))
            .collect();
        for (const drill of drills) {
            await ctx.db.delete(drill._id);
        }

        // Delete feature requests
        const featureRequests = await ctx.db
            .query("featureRequests")
            .withIndex("by_creator", (q) => q.eq("createdBy", userId))
            .collect();
        for (const request of featureRequests) {
            await ctx.db.delete(request._id);
        }

        // Delete feature votes
        const featureVotes = await ctx.db
            .query("featureVotes")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const vote of featureVotes) {
            await ctx.db.delete(vote._id);
        }

        // Finally, delete the user document
        await ctx.db.delete(userId);
    },
});