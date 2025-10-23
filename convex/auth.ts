import { convexAuth } from "@convex-dev/auth/server";
import ResendOTPPasswordless from "./ResendOTPPasswordless";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [ResendOTPPasswordless],
});