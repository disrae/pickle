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