import { internalMutation } from "./_generated/server";

// This mutation can be run once to seed the preset features
export const seedPresetFeatures = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get the first admin user to be the creator of preset features
        const adminUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isAdmin"), true))
            .first();

        if (!adminUser) {
            throw new Error("No admin user found. Cannot seed features.");
        }

        const now = Date.now();

        const presetFeatures = [
            {
                title: "Competitive Tournament Tab",
                description: "An ever-ending tournament system where players can schedule competitive matches, report scores, and climb the leaderboard. Track your ranking and compete with others!",
                category: "Gameplay",
                isPreset: true,
            },
            {
                title: "Player Matching by Skill Level",
                description: "Find partners and opponents that match your skill level. Get matched with players who are at a similar stage in their pickleball journey.",
                category: "Social",
            },
            {
                title: "Skill Rating Self-Assessment",
                description: "Rate your own skill level across different aspects of the game (serving, dinking, volleys, etc.) to help others understand your playing style and find better matches.",
                category: "Training",
            },
            {
                title: "Player Directory & Profiles",
                description: "Browse other players in your area, view their stats, skill ratings, and availability. Make it easier to find new people to play with.",
                category: "Social",
            },
            {
                title: "Friend System",
                description: "Add friends, see when they're playing, and easily coordinate games with your regular playing partners. Keep track of your favorite people to play with.",
                category: "Social",
            },
            {
                title: "Player Challenges",
                description: "Challenge other players to matches, set stakes (bragging rights, custom awards), and track your challenge record. Make the game more exciting with friendly competition.",
                category: "Gameplay",
            },
        ];

        // Check if features already exist to avoid duplicates
        const existingFeatures = await ctx.db
            .query("featureRequests")
            .filter((q) => q.eq(q.field("isPreset"), true))
            .collect();

        if (existingFeatures.length > 0) {
            console.log("Preset features already exist. Skipping seed.");
            return { message: "Preset features already exist", count: existingFeatures.length };
        }

        // Insert all preset features
        const insertedIds = [];
        for (const feature of presetFeatures) {
            const id = await ctx.db.insert("featureRequests", {
                ...feature,
                createdBy: adminUser._id,
                createdAt: now,
                isPreset: true,
            });
            insertedIds.push(id);
        }

        return { 
            message: "Preset features seeded successfully", 
            count: insertedIds.length 
        };
    },
});



