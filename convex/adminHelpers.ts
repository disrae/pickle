import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Make the current user an admin
export const makeCurrentUserAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        await ctx.db.patch(userId, {
            isAdmin: true,
        });

        return { success: true, message: "You are now an admin!" };
    },
});

// Make a user admin by userId
export const makeUserAdmin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(userId, {
            isAdmin: true,
        });

        return {
            success: true,
            message: `User ${user.name || user.email} is now an admin!`,
        };
    },
});

// Make a specific user an admin by email
export const makeUserAdminByEmail = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .first();

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        await ctx.db.patch(user._id, {
            isAdmin: true,
        });

        return {
            success: true,
            message: `User ${user.name || user.email} is now an admin!`,
        };
    },
});

// Check if current user is admin
export const isCurrentUserAdmin = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const user = await ctx.db.get(userId);
        return user?.isAdmin ?? false;
    },
});

// List all admin users
export const listAdmins = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const admins = users.filter((user) => user.isAdmin);

        return admins.map((admin) => ({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
        }));
    },
});

