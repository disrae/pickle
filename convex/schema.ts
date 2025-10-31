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

    drills: defineTable({
        title: v.string(),
        description: v.string(),
        category: v.string(),
        difficulty: v.string(),
        tags: v.array(v.string()),
        milestones: v.array(v.object({
            count: v.number(),
            description: v.string(),
        })),
        metricType: v.string(),
        metricDescription: v.string(),
        createdBy: v.id("users"),
        isOfficial: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_category", ["category"])
        .index("by_difficulty", ["difficulty"])
        .index("by_creator", ["createdBy"]),

    drillProgress: defineTable({
        userId: v.id("users"),
        drillId: v.id("drills"),
        completedMilestones: v.array(v.number()),
        personalBest: v.optional(v.number()),
        lastPracticedAt: v.optional(v.number()),
        totalSessions: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_drill", ["drillId"])
        .index("by_user_drill", ["userId", "drillId"]),

    trainingChats: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastMessageAt: v.optional(v.number()),
    })
        .index("by_last_message", ["lastMessageAt"]),

    trainingChatMessages: defineTable({
        chatId: v.id("trainingChats"),
        userId: v.id("users"),
        message: v.string(),
        createdAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_created", ["chatId", "createdAt"]),

    trainingChatParticipants: defineTable({
        chatId: v.id("trainingChats"),
        userId: v.id("users"),
        joinedAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_user", ["userId"])
        .index("by_chat_user", ["chatId", "userId"]),

    featureRequests: defineTable({
        title: v.string(),
        description: v.string(),
        category: v.string(),
        createdBy: v.id("users"),
        createdAt: v.number(),
        isPreset: v.boolean(),
    })
        .index("by_creator", ["createdBy"])
        .index("by_created", ["createdAt"]),

    featureVotes: defineTable({
        userId: v.id("users"),
        featureRequestId: v.id("featureRequests"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_feature", ["featureRequestId"])
        .index("by_user_feature", ["userId", "featureRequestId"]),

    builderChats: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastMessageAt: v.optional(v.number()),
    })
        .index("by_last_message", ["lastMessageAt"]),

    builderChatMessages: defineTable({
        chatId: v.id("builderChats"),
        userId: v.id("users"),
        message: v.string(),
        createdAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_created", ["chatId", "createdAt"]),

    builderChatParticipants: defineTable({
        chatId: v.id("builderChats"),
        userId: v.id("users"),
        joinedAt: v.number(),
    })
        .index("by_chat", ["chatId"])
        .index("by_user", ["userId"])
        .index("by_chat_user", ["chatId", "userId"]),
});

export default schema;