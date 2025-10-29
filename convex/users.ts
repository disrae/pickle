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