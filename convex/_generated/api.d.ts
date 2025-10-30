/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminHelpers from "../adminHelpers.js";
import type * as auth from "../auth.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chats from "../chats.js";
import type * as checkIns from "../checkIns.js";
import type * as courts from "../courts.js";
import type * as crons from "../crons.js";
import type * as drillProgress from "../drillProgress.js";
import type * as drills from "../drills.js";
import type * as http from "../http.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_email from "../otp/email.js";
import type * as plannedVisits from "../plannedVisits.js";
import type * as seedDrills from "../seedDrills.js";
import type * as trainingChatMessages from "../trainingChatMessages.js";
import type * as trainingChats from "../trainingChats.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminHelpers: typeof adminHelpers;
  auth: typeof auth;
  chatMessages: typeof chatMessages;
  chats: typeof chats;
  checkIns: typeof checkIns;
  courts: typeof courts;
  crons: typeof crons;
  drillProgress: typeof drillProgress;
  drills: typeof drills;
  http: typeof http;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/email": typeof otp_email;
  plannedVisits: typeof plannedVisits;
  seedDrills: typeof seedDrills;
  trainingChatMessages: typeof trainingChatMessages;
  trainingChats: typeof trainingChats;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
