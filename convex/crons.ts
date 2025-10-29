import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup every 5 minutes
crons.interval(
    "cleanup expired check-ins",
    { minutes: 5 },
    internal.checkIns.cleanupExpired
);

export default crons;

