import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Seed official drills - call this once to populate initial drill data
export const seedOfficialDrills = mutation({
    args: {},
    handler: async (ctx) => {
        // Get the first admin user (or create a system user)
        const adminUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isAdmin"), true))
            .first();

        if (!adminUser) {
            throw new Error("No admin user found to create official drills");
        }

        const now = Date.now();
        const drills = [
            // Serving Drills
            {
                title: "Deep Serve Mastery",
                description:
                    "Practice serving to the back third of the service box. Focus on consistent depth to push opponents back and set up the point.",
                category: "Serving",
                difficulty: "Beginner",
                tags: ["serve", "consistency", "depth"],
                milestones: [
                    { count: 1, description: "1 in a row" },
                    { count: 5, description: "5 in a row" },
                    { count: 10, description: "10 in a row" },
                    { count: 20, description: "20 in a row" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive successful deep serves",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Corner Target Serves",
                description:
                    "Serve to the corners of the service box (both left and right). Aim for the back corners to create difficult angles for receivers.",
                category: "Serving",
                difficulty: "Intermediate",
                tags: ["serve", "accuracy", "placement"],
                milestones: [
                    { count: 3, description: "3 consecutive per corner" },
                    { count: 5, description: "5 consecutive per corner" },
                    { count: 10, description: "10 consecutive per corner" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive successful corner serves per target",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Spin Serve Practice",
                description:
                    "Work on adding topspin or slice to your serves. Practice generating spin while maintaining accuracy and depth.",
                category: "Serving",
                difficulty: "Advanced",
                tags: ["serve", "spin", "technique"],
                milestones: [
                    { count: 5, description: "5 successful spin serves" },
                    { count: 10, description: "10 successful spin serves" },
                    { count: 20, description: "20 successful spin serves" },
                ],
                metricType: "consecutive",
                metricDescription: "Successful serves with noticeable spin",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },

            // Drop Shot Drills
            {
                title: "Kitchen Line Drops",
                description:
                    "From the transition zone (mid-court), practice drop shots that land within 2 feet of the kitchen line. Focus on soft hands and arc.",
                category: "Drop Shot",
                difficulty: "Beginner",
                tags: ["drop", "transition", "soft game"],
                milestones: [
                    { count: 5, description: "5 consecutive drops" },
                    { count: 10, description: "10 consecutive drops" },
                    { count: 20, description: "20 consecutive drops" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive drops within 2 feet of kitchen line",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Third Shot Drop from Baseline",
                description:
                    "Practice the crucial third shot drop from the baseline. Focus on clearing the net by 1-2 feet and landing in the kitchen.",
                category: "Drop Shot",
                difficulty: "Intermediate",
                tags: ["drop", "third shot", "baseline"],
                milestones: [
                    { count: 3, description: "3 consecutive" },
                    { count: 7, description: "7 consecutive" },
                    { count: 15, description: "15 consecutive" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive successful third shot drops",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },

            // Dinking Drills
            {
                title: "Cross-Court Dinking Rally",
                description:
                    "Rally with a partner using only cross-court dinks. Focus on keeping the ball low over the net and maintaining control.",
                category: "Dinking",
                difficulty: "Intermediate",
                tags: ["dink", "control", "partner"],
                milestones: [
                    { count: 10, description: "10 consecutive rallies" },
                    { count: 25, description: "25 consecutive rallies" },
                    { count: 50, description: "50 consecutive rallies" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive cross-court dinks without error",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Dink and Move",
                description:
                    "While dinking, side-step along the kitchen line from left to right. Maintain dinking accuracy while moving your feet.",
                category: "Dinking",
                difficulty: "Advanced",
                tags: ["dink", "footwork", "movement"],
                milestones: [
                    { count: 3, description: "3 minutes continuous" },
                    { count: 5, description: "5 minutes continuous" },
                    { count: 10, description: "10 minutes continuous" },
                ],
                metricType: "time",
                metricDescription: "Minutes of continuous dinking while moving",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },

            // Reset Drills
            {
                title: "Smash Reset from Baseline",
                description:
                    "Partner hits smashes while you practice resetting from the baseline back to the kitchen. Focus on absorbing pace and dropping the ball soft.",
                category: "Reset",
                difficulty: "Advanced",
                tags: ["reset", "defense", "baseline"],
                milestones: [
                    { count: 3, description: "3 consecutive resets" },
                    { count: 5, description: "5 consecutive resets" },
                    { count: 10, description: "10 consecutive resets" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive successful resets to kitchen",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Block and Reset at Kitchen",
                description:
                    "Stand at the kitchen line while partner drives balls at you. Practice blocking and resetting with minimal backswing.",
                category: "Reset",
                difficulty: "Intermediate",
                tags: ["reset", "block", "kitchen"],
                milestones: [
                    { count: 5, description: "5 successful blocks" },
                    { count: 10, description: "10 successful blocks" },
                    { count: 20, description: "20 successful blocks" },
                ],
                metricType: "consecutive",
                metricDescription: "Successful blocks that stay in the kitchen",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },

            // Volley Drills
            {
                title: "Wall Volleys",
                description:
                    "Volley continuously against a wall without letting the ball bounce. Great for reaction time and hand-eye coordination.",
                category: "Volley",
                difficulty: "Beginner",
                tags: ["volley", "solo", "reaction"],
                milestones: [
                    { count: 1, description: "1 minute continuous" },
                    { count: 3, description: "3 minutes continuous" },
                    { count: 5, description: "5 minutes continuous" },
                ],
                metricType: "time",
                metricDescription: "Minutes of continuous volleys",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Rapid Fire Volleys",
                description:
                    "Partner feeds you fast volleys from mid-court. Focus on quick paddle preparation and solid contact.",
                category: "Volley",
                difficulty: "Intermediate",
                tags: ["volley", "speed", "partner"],
                milestones: [
                    { count: 10, description: "10 consecutive volleys" },
                    { count: 20, description: "20 consecutive volleys" },
                    { count: 30, description: "30 consecutive volleys" },
                ],
                metricType: "consecutive",
                metricDescription: "Consecutive successful volleys",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },

            // Footwork Drills
            {
                title: "Split-Step Practice",
                description:
                    "Practice the fundamental split-step timing. Jump lightly and land on balls of feet as opponent makes contact with ball.",
                category: "Footwork",
                difficulty: "Beginner",
                tags: ["footwork", "fundamentals", "timing"],
                milestones: [
                    { count: 25, description: "25 reps with proper form" },
                    { count: 50, description: "50 reps with proper form" },
                    { count: 100, description: "100 reps with proper form" },
                ],
                metricType: "total_count",
                metricDescription: "Total reps with correct split-step form",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Baseline to Kitchen Sprints",
                description:
                    "Sprint from baseline to kitchen line and back. Focus on explosive forward movement and controlled deceleration.",
                category: "Footwork",
                difficulty: "Beginner",
                tags: ["footwork", "speed", "conditioning"],
                milestones: [
                    { count: 10, description: "10 reps under 60 seconds" },
                    { count: 15, description: "15 reps under 90 seconds" },
                    { count: 20, description: "20 reps under 120 seconds" },
                ],
                metricType: "time",
                metricDescription: "Complete reps under target time",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
            {
                title: "Shadow Drills",
                description:
                    "Move through shot sequences without the ball. Practice proper footwork, positioning, and paddle preparation for serves, returns, and volleys.",
                category: "Footwork",
                difficulty: "Intermediate",
                tags: ["footwork", "solo", "technique"],
                milestones: [
                    { count: 5, description: "5 minutes continuous" },
                    { count: 10, description: "10 minutes continuous" },
                    { count: 15, description: "15 minutes continuous" },
                ],
                metricType: "time",
                metricDescription: "Minutes of continuous shadow practice",
                createdBy: adminUser._id,
                isOfficial: true,
                createdAt: now,
            },
        ];

        // Insert all drills
        const drillIds = await Promise.all(
            drills.map((drill) => ctx.db.insert("drills", drill))
        );

        return {
            success: true,
            count: drillIds.length,
            message: `Successfully seeded ${drillIds.length} official drills`,
        };
    },
});

