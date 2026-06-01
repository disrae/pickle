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
        image: v.optional(v.id("_storage")),
        isAnonymous: v.optional(v.boolean()),
        isAdmin: v.optional(v.boolean()),
        selectedCourtId: v.optional(v.id("courts")),
        expoPushToken: v.optional(v.string()),
        /** Ghost mode — when false, user never appears on court roster */
        appearAtCourt: v.optional(v.boolean()),
        /** foreground = while app open; background = geofence in pocket; off = manual only */
        locationCheckInMode: v.optional(
            v.union(v.literal("foreground"), v.literal("background"), v.literal("off"))
        ),
        coachOnboardingComplete: v.optional(v.boolean()),
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
        lineupSlots: v.optional(v.number()),
        currentLineupCount: v.optional(v.number()),
        lineupReportedBy: v.optional(v.id("users")),
        lineupReportedAt: v.optional(v.number()),
        courtReportedDryAt: v.optional(v.number()),
        courtReportedDryBy: v.optional(v.id("users")),
    }),

    checkIns: defineTable({
        userId: v.id("users"),
        courtId: v.id("courts"),
        checkedInAt: v.number(),
        expiresAt: v.number(),
        /** Per-session private arrival — hidden from roster but still checked in */
        isPrivate: v.optional(v.boolean()),
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

    courtWallMessages: defineTable({
        courtId: v.id("courts"),
        userId: v.id("users"),
        message: v.string(),
        createdAt: v.number(),
        expiresAt: v.number(),
        editedAt: v.optional(v.number()),
    })
        .index("by_court", ["courtId"])
        .index("by_court_created", ["courtId", "createdAt"])
        .index("by_expiry", ["expiresAt"]),

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
        notifyOnNewMessage: v.optional(v.boolean()),
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
        notifyOnNewMessage: v.optional(v.boolean()),
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
        notifyOnNewMessage: v.optional(v.boolean()),
    })
        .index("by_chat", ["chatId"])
        .index("by_user", ["userId"])
        .index("by_chat_user", ["chatId", "userId"]),

    lineupReports: defineTable({
        courtId: v.id("courts"),
        userId: v.id("users"),
        lineupCount: v.number(),
        reportedAt: v.number(),
    })
        .index("by_court", ["courtId"])
        .index("by_user", ["userId"]),

    conditionReports: defineTable({
        courtId: v.id("courts"),
        userId: v.id("users"),
        reportedAt: v.number(),
    })
        .index("by_court", ["courtId"])
        .index("by_user", ["userId"]),

    userNotificationSettings: defineTable({
        userId: v.id("users"),
        subscribedToUserId: v.id("users"),
        notifyOnCheckIn: v.boolean(),
        notifyOnPlannedVisit: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_subscribed_to", ["subscribedToUserId"])
        .index("by_user_and_subscribed", ["userId", "subscribedToUserId"]),

    skillsProfiles: defineTable({
        userId: v.id("users"),
        overallLevel: v.optional(v.number()),
        serving: v.optional(v.number()),
        dinking: v.optional(v.number()),
        dropShot: v.optional(v.number()),
        reset: v.optional(v.number()),
        volley: v.optional(v.number()),
        footwork: v.optional(v.number()),
        confirmedAt: v.optional(v.number()),
        proposedAt: v.optional(v.number()),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    coachMessages: defineTable({
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        createdAt: v.number(),
    }).index("by_user_created", ["userId", "createdAt"]),

    blockedUsers: defineTable({
        userId: v.id("users"),
        blockedUserId: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_blocked_user", ["blockedUserId"])
        .index("by_user_and_blocked", ["userId", "blockedUserId"]),

    // --- Phase 6: Teams & Tournament ---

    teams: defineTable({
        name: v.string(),
        player1Id: v.id("users"),
        player2Id: v.id("users"),
        rating: v.number(),
        matchesPlayed: v.number(),
        wins: v.number(),
        losses: v.number(),
        createdAt: v.number(),
    })
        .index("by_player1", ["player1Id"])
        .index("by_player2", ["player2Id"])
        .index("by_rating", ["rating"]),

    teamInvites: defineTable({
        teamName: v.string(),
        inviterId: v.id("users"),
        inviteeId: v.id("users"),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
        createdAt: v.number(),
    })
        .index("by_invitee", ["inviteeId"])
        .index("by_inviter", ["inviterId"]),

    individualRatings: defineTable({
        userId: v.id("users"),
        rating: v.number(),
        matchesPlayed: v.number(),
        wins: v.number(),
        losses: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_rating", ["rating"]),

    matches: defineTable({
        format: v.union(v.literal("doubles"), v.literal("singles")),
        courtId: v.id("courts"),
        /** Doubles: registered team IDs (optional — ad-hoc matches won't have these) */
        team1Id: v.optional(v.id("teams")),
        team2Id: v.optional(v.id("teams")),
        /** All participants. Doubles: 4 players. Singles: p1 + p3 only. */
        p1Id: v.id("users"),
        p2Id: v.optional(v.id("users")),
        p3Id: v.id("users"),
        p4Id: v.optional(v.id("users")),
        /** Scores from team1/p1 side perspective */
        score1: v.number(),
        score2: v.number(),
        reportedBy: v.id("users"),
        reportedAt: v.number(),
        confirmedBy: v.optional(v.id("users")),
        confirmedAt: v.optional(v.number()),
        status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("disputed")),
        /** True once post-match coach debrief has been triggered for each side */
        debriefTriggeredP1: v.optional(v.boolean()),
        debriefTriggeredP3: v.optional(v.boolean()),
        createdAt: v.number(),
    })
        .index("by_team1", ["team1Id"])
        .index("by_team2", ["team2Id"])
        .index("by_p1", ["p1Id"])
        .index("by_p3", ["p3Id"])
        .index("by_court", ["courtId"])
        .index("by_status", ["status"]),

    challenges: defineTable({
        challengerId: v.id("users"),
        challengerPartnerId: v.optional(v.id("users")),
        challengerTeamId: v.optional(v.id("teams")),
        challengedId: v.id("users"),
        challengedPartnerId: v.optional(v.id("users")),
        challengedTeamId: v.optional(v.id("teams")),
        format: v.union(v.literal("doubles"), v.literal("singles")),
        courtId: v.id("courts"),
        status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("declined"),
            v.literal("completed"),
            v.literal("expired")
        ),
        matchId: v.optional(v.id("matches")),
        createdAt: v.number(),
        respondedAt: v.optional(v.number()),
    })
        .index("by_challenger", ["challengerId"])
        .index("by_challenged", ["challengedId"])
        .index("by_status", ["status"]),

    scheduledMatches: defineTable({
        challengeId: v.optional(v.id("challenges")),
        courtId: v.id("courts"),
        scheduledTime: v.number(),
        p1Id: v.id("users"),
        p2Id: v.optional(v.id("users")),
        p3Id: v.id("users"),
        p4Id: v.optional(v.id("users")),
        team1Id: v.optional(v.id("teams")),
        team2Id: v.optional(v.id("teams")),
        format: v.union(v.literal("doubles"), v.literal("singles")),
        matchId: v.optional(v.id("matches")),
        createdAt: v.number(),
    })
        .index("by_p1", ["p1Id"])
        .index("by_p3", ["p3Id"])
        .index("by_court_time", ["courtId", "scheduledTime"]),
});

export default schema;