import { PicklePaddle } from "@/assets/icons/picklepaddle";
import { Popup } from "@/components/ui/Popup";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useLoading } from "@/lib/loading-context";
import { useTheme } from "@/lib/theme-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const { top, bottom } = useSafeAreaInsets();
    const { theme } = useTheme();
    const { signIn } = useAuthActions();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">("signIn");
    const [submitting, setSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const { showLoading, hideLoading } = useLoading();

    const isLoadingUser = user === undefined;
    useEffect(() => {
        if (isLoadingUser) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoadingUser, showLoading, hideLoading]);

    if (user !== undefined && user !== null) {
        return <Redirect href="/(authenticated)/(tabs)" />;
    }

    if (isLoadingUser) {
        return null;
    }

    const heroGradient: [string, string, string] =
        theme === "dark"
            ? ["#1a2410", "#0f1409", "#0b0e09"]
            : ["#dcff7a", "#eef9d2", "#fafaf7"];

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

    const handleContinueAsGuest = () => {
        router.push("/(authenticated)/(tabs)/court");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
            <LinearGradient
                colors={heroGradient}
                locations={[0, 0.55, 1]}
                className="absolute left-0 right-0 top-0"
                style={{ height: 420 }}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: top + 56,
                    paddingBottom: bottom + 24,
                    paddingHorizontal: 24,
                }}
            >
                <View className="w-full max-w-md self-center">
                    {/* Brand mark */}
                    <View className="items-center">
                        <View
                            className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand"
                            style={{
                                shadowColor: "#84cc16",
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.35,
                                shadowRadius: 20,
                                elevation: 10,
                            }}
                        >
                            <PicklePaddle width={42} height={42} tintColor="#151c0c" />
                        </View>
                        <Text className="mt-5 text-4xl font-extrabold tracking-tight text-foreground">
                            WePickle
                        </Text>
                        <Text className="mt-2 text-base text-foreground-muted">
                            Your court. Your crew. Your game.
                        </Text>
                    </View>

                    {/* Auth card */}
                    <View
                        className="mt-9 w-full rounded-[28px] border border-border bg-surface p-6"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: theme === "dark" ? 0.4 : 0.1,
                            shadowRadius: 24,
                            elevation: 8,
                        }}
                    >
                        {/* Sign in / Sign up segmented control */}
                        <View className="mb-6 flex-row rounded-2xl bg-surface-2 p-1">
                            {(["signIn", "signUp"] as const).map((flow) => {
                                const active = passwordFlow === flow;
                                return (
                                    <Pressable
                                        key={flow}
                                        onPress={() => setPasswordFlow(flow)}
                                        className={`flex-1 rounded-xl py-2.5 ${active ? "bg-brand" : ""}`}
                                    >
                                        <Text
                                            className={`text-center font-bold ${active ? "text-brand-foreground" : "text-foreground-muted"}`}
                                        >
                                            {flow === "signIn" ? "Sign In" : "Sign Up"}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View className="gap-4">
                            <StyledInput
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoComplete="email"
                                textContentType="emailAddress"
                            />
                            <StyledInput
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

                        <View className="h-6" />

                        <StyledButton
                            onPress={handlePasswordAuth}
                            title={passwordFlow === "signUp" ? "Create account" : "Sign in"}
                            variant="brand"
                            loading={submitting}
                        />

                        <View className="my-5 flex-row items-center">
                            <View className="h-px flex-1 bg-border" />
                            <Text className="px-4 text-sm text-foreground-muted">or</Text>
                            <View className="h-px flex-1 bg-border" />
                        </View>

                        <StyledButton
                            onPress={handleContinueAsGuest}
                            title="Continue as Guest"
                            variant="secondary"
                        />

                        <Text className="mt-3 text-center text-xs text-foreground-muted">
                            Guest mode is read-only. Sign in to unlock all features.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <Popup
                isVisible={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                message={popupMessage}
            />
        </KeyboardAvoidingView>
    );
}
