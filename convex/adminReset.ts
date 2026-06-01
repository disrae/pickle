import { v } from "convex/values";
import { mutation } from "./_generated/server";

const ALL_APP_TABLES = [
    "users",
    "courts",
    "checkIns",
    "plannedVisits",
    "chats",
    "chatMessages",
    "chatParticipants",
    "drills",
    "drillProgress",
    "trainingChats",
    "trainingChatMessages",
    "trainingChatParticipants",
    "featureRequests",
    "featureVotes",
    "builderChats",
    "builderChatMessages",
    "builderChatParticipants",
    "lineupReports",
    "conditionReports",
    "userNotificationSettings",
    "blockedUsers",
] as const;

const AUTH_TABLE_CANDIDATES = [
    "authAccounts",
    "authSessions",
    "authRefreshTokens",
    "authVerificationCodes",
    "accounts",
    "sessions",
    "refreshTokens",
    "verificationCodes",
] as const;

async function clearTableByName(ctx: any, tableName: string) {
    try {
        const docs = await ctx.db.query(tableName).collect();
        for (const doc of docs) {
            await ctx.db.delete(doc._id);
        }
        return docs.length;
    } catch {
        return 0;
    }
}

export const wipeAllData = mutation({
    args: {
        confirm: v.string(),
    },
    handler: async (ctx, { confirm }) => {
        if (confirm !== "WIPE_ALL_DATA") {
            throw new Error("Refusing to wipe data. Pass confirm: \"WIPE_ALL_DATA\".");
        }

        let deletedCount = 0;
        for (const tableName of ALL_APP_TABLES) {
            deletedCount += await clearTableByName(ctx, tableName);
        }
        for (const tableName of AUTH_TABLE_CANDIDATES) {
            deletedCount += await clearTableByName(ctx, tableName);
        }
        return { ok: true, deletedCount };
    },
});

