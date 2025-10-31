import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all feature requests with vote counts and user's vote status
export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        
        const features = await ctx.db
            .query("featureRequests")
            .withIndex("by_created")
            .order("desc")
            .collect();

        // Get vote counts and user's vote status for each feature
        const featuresWithVotes = await Promise.all(
            features.map(async (feature) => {
                const votes = await ctx.db
                    .query("featureVotes")
                    .withIndex("by_feature", (q) => q.eq("featureRequestId", feature._id))
                    .collect();

                const voteCount = votes.length;
                const userHasVoted = userId 
                    ? votes.some((vote) => vote.userId === userId)
                    : false;

                const creator = await ctx.db.get(feature.createdBy);

                return {
                    ...feature,
                    voteCount,
                    userHasVoted,
                    creator: creator ? { 
                        _id: creator._id,
                        name: creator.name, 
                        email: creator.email,
                        isAdmin: creator.isAdmin 
                    } : null,
                };
            })
        );

        return featuresWithVotes;
    },
});

// Create a new feature request
export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
    },
    handler: async (ctx, { title, description, category }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const featureId = await ctx.db.insert("featureRequests", {
            title,
            description,
            category,
            createdBy: userId,
            createdAt: Date.now(),
            isPreset: false,
        });

        return featureId;
    },
});

// Delete a feature request (only creator or admin)
export const deleteFeature = mutation({
    args: { featureRequestId: v.id("featureRequests") },
    handler: async (ctx, { featureRequestId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const feature = await ctx.db.get(featureRequestId);
        if (!feature) {
            throw new Error("Feature not found");
        }

        const user = await ctx.db.get(userId);
        const isCreator = feature.createdBy === userId;
        const isAdmin = user?.isAdmin === true;

        if (!isCreator && !isAdmin) {
            throw new Error("Not authorized to delete this feature");
        }

        // Delete all votes for this feature
        const votes = await ctx.db
            .query("featureVotes")
            .withIndex("by_feature", (q) => q.eq("featureRequestId", featureRequestId))
            .collect();

        for (const vote of votes) {
            await ctx.db.delete(vote._id);
        }

        // Delete the feature
        await ctx.db.delete(featureRequestId);
    },
});

// Toggle vote for a feature request
export const toggleVote = mutation({
    args: { featureRequestId: v.id("featureRequests") },
    handler: async (ctx, { featureRequestId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Check if user has already voted
        const existingVote = await ctx.db
            .query("featureVotes")
            .withIndex("by_user_feature", (q) =>
                q.eq("userId", userId).eq("featureRequestId", featureRequestId)
            )
            .first();

        if (existingVote) {
            // Remove vote
            await ctx.db.delete(existingVote._id);
            return { voted: false };
        } else {
            // Add vote
            await ctx.db.insert("featureVotes", {
                userId,
                featureRequestId,
                createdAt: Date.now(),
            });
            return { voted: true };
        }
    },
});

// Get current user's votes
export const getUserVotes = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        const votes = await ctx.db
            .query("featureVotes")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return votes.map((vote) => vote.featureRequestId);
    },
});

