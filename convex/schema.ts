import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,

    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        image: v.optional(v.string()),
        isAnonymous: v.optional(v.boolean()),
        isAdmin: v.optional(v.boolean()),
        selectedCourtId: v.optional(v.id("courts")),
    })
        .index("email", ["email"])
        .index("phone", ["phone"]),

    courts: defineTable({
        name: v.string(),
        location: v.object({
            lat: v.number(),
            lng: v.number(),
        }),
        notes: v.optional(v.string()),
    }),

    checkIns: defineTable({
        userId: v.id("users"),
        courtId: v.id("courts"),
        checkedInAt: v.number(),
        expiresAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_court", ["courtId"])
        .index("by_expiry", ["expiresAt"]),

    plannedVisits: defineTable({
        userId: v.id("users"),
        courtId: v.id("courts"),
        plannedTime: v.number(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_court", ["courtId"])
        .index("by_time", ["courtId", "plannedTime"]),

    chats: defineTable({
        courtId: v.id("courts"),
        title: v.string(),
        description: v.optional(v.string()),
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastMessageAt: v.optional(v.number()),
    })
        .index("by_court", ["courtId"])
        .index("by_last_message", ["courtId", "lastMessageAt"]),

    chatMessages: defineTable({
        chatId: v.id("chats"),
        userId: v.id("users"),
        message: v.string(),
        createdAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_created", ["chatId", "createdAt"]),

    chatParticipants: defineTable({
        chatId: v.id("chats"),
        userId: v.id("users"),
        joinedAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_user", ["userId"])
        .index("by_chat_user", ["chatId", "userId"]),
});

export default schema;