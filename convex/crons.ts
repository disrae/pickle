import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup every 5 minutes
crons.interval(
    "cleanup expired check-ins",
    { minutes: 5 },
    internal.checkIns.cleanupExpired
);

crons.interval(
    "auto-confirm stale match scores",
    { hours: 1 },
    internal.challenges.autoConfirmStaleMatches
);

export default crons;

