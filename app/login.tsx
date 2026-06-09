import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Popup } from "@/components/ui/Popup";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import {
    Keyboard,
    Pressable,
    Text,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
    const { top } = useSafeAreaInsets();
    const { signIn } = useAuthActions();
    const user = useQuery(api.users.currentUser);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">("signIn");
    const [authView, setAuthView] = useState<"login" | "forgotPassword" | "resetPassword">("login");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const authResolved = useRef(user !== undefined);
    if (user !== undefined) {
        authResolved.current = true;
    }

    if (user !== undefined && user !== null) {
        return <Redirect href="/(authenticated)/(tabs)" />;
    }

    if (!authResolved.current) {
        return null;
    }

    const showErrorPopup = (error: unknown) => {
        const rawMessage =
            error instanceof Error ? error.message : "Something went wrong while signing you in.";
        const normalizedMessage = rawMessage.toLowerCase();
        let friendlyMessage = "We couldn't complete that request. Please try again.";

        if (normalizedMessage.includes("invalid password")) {
            friendlyMessage = "That password doesn't look right. Please try again.";
        } else if (normalizedMessage.includes("not found")) {
            friendlyMessage = "We couldn't find an account with that email yet.";
        } else if (normalizedMessage.includes("already")) {
            friendlyMessage = "That email is already in use. Try signing in instead.";
        } else if (normalizedMessage.includes("8 characters")) {
            friendlyMessage = "Password must be at least 8 characters.";
        } else if (normalizedMessage.includes("email")) {
            friendlyMessage = "Please enter a valid email address.";
        }

        setPopupTitle("Sign in issue");
        setPopupMessage(friendlyMessage);
        setShowPopup(true);
    };

    const handlePasswordAuth = async () => {
        Keyboard.dismiss();

        if (!email.trim() || !password.trim()) {
            setPopupTitle("Missing info");
            setPopupMessage("Enter both email and password to continue.");
            setShowPopup(true);
            return;
        }

        setSubmitting(true);
        try {
            await signIn("password", {
                email: email.trim().toLowerCase(),
                password,
                flow: passwordFlow,
            });
        } catch (error) {
            console.error("Password auth error:", error);
            showErrorPopup(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendResetCode = async () => {
        Keyboard.dismiss();

        if (!email.trim()) {
            setPopupTitle("Missing email");
            setPopupMessage("Enter your email address to receive a reset code.");
            setShowPopup(true);
            return;
        }

        setSubmitting(true);
        try {
            await signIn("password", {
                email: email.trim().toLowerCase(),
                flow: "reset",
            });
            setResetCode("");
            setNewPassword("");
            setAuthView("resetPassword");
        } catch (error) {
            console.error("Password reset error:", error);
            const rawMessage = error instanceof Error ? error.message : "";
            const normalizedMessage = rawMessage.toLowerCase();
            let friendlyMessage = "We couldn't send a reset code. Check your email and try again.";

            if (normalizedMessage.includes("domain is not verified")) {
                friendlyMessage =
                    "Password reset email is not configured yet. Please try again later or contact support.";
            } else if (normalizedMessage.includes("brevo_api_key")) {
                friendlyMessage = "Password reset email is not configured yet. Please contact support.";
            }

            setPopupTitle("Reset issue");
            setPopupMessage(friendlyMessage);
            setShowPopup(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        Keyboard.dismiss();

        if (!resetCode.trim() || !newPassword.trim()) {
            setPopupTitle("Missing info");
            setPopupMessage("Enter the code from your email and a new password.");
            setShowPopup(true);
            return;
        }

        setSubmitting(true);
        try {
            await signIn("password", {
                email: email.trim().toLowerCase(),
                code: resetCode.trim(),
                newPassword,
                flow: "reset-verification",
            });
        } catch (error) {
            console.error("Password reset verification error:", error);
            const rawMessage = error instanceof Error ? error.message : "";
            const normalizedMessage = rawMessage.toLowerCase();
            let friendlyMessage = "That code didn't work or your new password is invalid. Try again.";

            if (normalizedMessage.includes("8 characters")) {
                friendlyMessage = "Password must be at least 8 characters.";
            }

            setPopupTitle("Reset issue");
            setPopupMessage(friendlyMessage);
            setShowPopup(true);
        } finally {
            setSubmitting(false);
        }
    };

    const backToSignIn = () => {
        setAuthView("login");
        setResetCode("");
        setNewPassword("");
    };

    return (
        <Background>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                bottomOffset={24}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: top + 16,
                    paddingBottom: 24,
                    paddingHorizontal: 24,
                }}
            >
                    <View style={{ width: "100%", maxWidth: 448, alignSelf: "center" }}>
                        <View className="items-center pt-2">
                            <Image
                                source={require("@/assets/icons/splash-icon-light.png")}
                                style={{ width: 96, height: 96 }}
                                contentFit="contain"
                            />
                            <Text className="mt-5 text-5xl font-display-bold tracking-tight text-foreground">
                                WePickle
                            </Text>
                            <Text className="mt-3 text-lg text-muted-foreground">
                                Your court. Your crew. Your game.
                            </Text>
                        </View>

                        <GlassContainer style={{ marginTop: 36, borderRadius: 28, padding: 24 }}>
                            {authView === "login" ? (
                                <>
                                    <View className="mb-6 flex-row rounded-2xl border border-border bg-background/50 p-1">
                                        {(["signIn", "signUp"] as const).map((flow) => {
                                            const active = passwordFlow === flow;
                                            return (
                                                <Pressable
                                                    key={flow}
                                                    onPress={() => setPasswordFlow(flow)}
                                                    className={`flex-1 rounded-xl py-3 ${active ? "bg-brand" : ""}`}
                                                >
                                                    <Text
                                                        className={`text-center text-lg font-bold ${active ? "text-brand-foreground" : "text-foreground"}`}
                                                    >
                                                        {flow === "signIn" ? "Sign In" : "Sign Up"}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    <View className="gap-4">
                                        <StyledInput
                                            large
                                            label="Email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoComplete="email"
                                            textContentType="emailAddress"
                                        />
                                        <StyledInput
                                            large
                                            label="Password"
                                            placeholder={
                                                passwordFlow === "signUp"
                                                    ? "Create a password (min 8 chars)"
                                                    : "Enter your password"
                                            }
                                            secureTextEntry
                                            value={password}
                                            onChangeText={setPassword}
                                            autoComplete="password"
                                            textContentType="password"
                                        />
                                    </View>

                                    {passwordFlow === "signIn" ? (
                                        <Pressable
                                            onPress={() => setAuthView("forgotPassword")}
                                            className="mt-3 self-end"
                                        >
                                            <Text className="text-base font-semibold text-brand-strong">
                                                Forgot password?
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <View className="h-3" />
                                    )}

                                    <View className="h-6" />

                                    <StyledButton
                                        onPress={handlePasswordAuth}
                                        title={passwordFlow === "signUp" ? "Create account" : "Sign in"}
                                        variant="brand"
                                        large
                                        loading={submitting}
                                    />
                                </>
                            ) : authView === "forgotPassword" ? (
                                <>
                                    <Text className="mb-2 text-2xl font-bold text-foreground">
                                        Reset password
                                    </Text>
                                    <Text className="mb-6 text-base text-muted-foreground">
                                        Enter your email and we will send you a reset code.
                                    </Text>

                                    <StyledInput
                                        large
                                        label="Email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        textContentType="emailAddress"
                                    />

                                    <View className="h-6" />

                                    <StyledButton
                                        onPress={handleSendResetCode}
                                        title="Send reset code"
                                        variant="brand"
                                        large
                                        loading={submitting}
                                    />

                                    <Pressable onPress={backToSignIn} className="mt-4 items-center py-2">
                                        <Text className="text-base font-semibold text-muted-foreground">
                                            Back to sign in
                                        </Text>
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <Text className="mb-2 text-2xl font-bold text-foreground">
                                        Check your email
                                    </Text>
                                    <View className="mb-6">
                                        <Text className="text-base text-muted-foreground">
                                            Enter the 4-digit code we sent to {email} and choose a new password.
                                        </Text>
                                        <Text className="mt-1.5 text-sm text-muted-foreground/70">
                                            Didn&apos;t get it? Check your spam or junk folder.
                                        </Text>
                                    </View>

                                    <View className="gap-4">
                                        <StyledInput
                                            large
                                            label="Reset code"
                                            placeholder="1234"
                                            value={resetCode}
                                            onChangeText={setResetCode}
                                            autoComplete="off"
                                        />
                                        <StyledInput
                                            large
                                            label="New password"
                                            placeholder="At least 8 characters"
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            autoComplete="password"
                                            textContentType="password"
                                        />
                                    </View>

                                    <View className="h-6" />

                                    <StyledButton
                                        onPress={handleResetPassword}
                                        title="Update password"
                                        variant="brand"
                                        large
                                        loading={submitting}
                                    />

                                    <Pressable onPress={backToSignIn} className="mt-4 items-center py-2">
                                        <Text className="text-base font-semibold text-muted-foreground">
                                            Back to sign in
                                        </Text>
                                    </Pressable>
                                </>
                            )}
                        </GlassContainer>
                    </View>
            </KeyboardAwareScrollView>

            <Popup
                isVisible={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                message={popupMessage}
            />
        </Background>
    );
}
