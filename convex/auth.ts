import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [Password({
        id: "password",
        validatePasswordRequirements: (password) => {
            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters long.");
            }
        },
    })],
    session: {
        totalDurationMs: 1000 * 60 * 60 * 24 * 365, // 365 days
        inactiveDurationMs: 1000 * 60 * 60 * 24 * 365, // 365 days
    },
    jwt: {
        durationMs: 1000 * 60 * 60 * 24, // 1 day
    },
});