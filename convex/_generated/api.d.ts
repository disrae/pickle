/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as BrevoOTPPasswordReset from "../BrevoOTPPasswordReset.js";
import type * as adminHelpers from "../adminHelpers.js";
import type * as adminReset from "../adminReset.js";
import type * as auth from "../auth.js";
import type * as blockedUsers from "../blockedUsers.js";
import type * as builderChatMessages from "../builderChatMessages.js";
import type * as builderChats from "../builderChats.js";
import type * as challenges from "../challenges.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chats from "../chats.js";
import type * as checkIns from "../checkIns.js";
import type * as coach from "../coach.js";
import type * as coachActions from "../coachActions.js";
import type * as courtWall from "../courtWall.js";
import type * as courts from "../courts.js";
import type * as crons from "../crons.js";
import type * as drillProgress from "../drillProgress.js";
import type * as drills from "../drills.js";
import type * as featureRequests from "../featureRequests.js";
import type * as http from "../http.js";
import type * as plannedVisits from "../plannedVisits.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as ratings from "../ratings.js";
import type * as seedDrills from "../seedDrills.js";
import type * as seedFeatures from "../seedFeatures.js";
import type * as skillsProfiles from "../skillsProfiles.js";
import type * as teams from "../teams.js";
import type * as trainingChatMessages from "../trainingChatMessages.js";
import type * as trainingChats from "../trainingChats.js";
import type * as userNotificationSettings from "../userNotificationSettings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  BrevoOTPPasswordReset: typeof BrevoOTPPasswordReset;
  adminHelpers: typeof adminHelpers;
  adminReset: typeof adminReset;
  auth: typeof auth;
  blockedUsers: typeof blockedUsers;
  builderChatMessages: typeof builderChatMessages;
  builderChats: typeof builderChats;
  challenges: typeof challenges;
  chatMessages: typeof chatMessages;
  chats: typeof chats;
  checkIns: typeof checkIns;
  coach: typeof coach;
  coachActions: typeof coachActions;
  courtWall: typeof courtWall;
  courts: typeof courts;
  crons: typeof crons;
  drillProgress: typeof drillProgress;
  drills: typeof drills;
  featureRequests: typeof featureRequests;
  http: typeof http;
  plannedVisits: typeof plannedVisits;
  pushNotifications: typeof pushNotifications;
  ratings: typeof ratings;
  seedDrills: typeof seedDrills;
  seedFeatures: typeof seedFeatures;
  skillsProfiles: typeof skillsProfiles;
  teams: typeof teams;
  trainingChatMessages: typeof trainingChatMessages;
  trainingChats: typeof trainingChats;
  userNotificationSettings: typeof userNotificationSettings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
