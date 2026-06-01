import { Popup } from "@/components/ui/Popup";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useLoading } from "@/lib/loading-context";
import { useTheme } from "@/lib/theme-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export default function LoginScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const { theme } = useTheme();
    const { signIn } = useAuthActions();
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

    return (
        <View style={{ flex: 1, backgroundColor: heroGradient[2] }}>
            <LinearGradient
                colors={heroGradient}
                locations={[0, 0.55, 1]}
                pointerEvents="none"
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {theme === "dark" && (
                <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Defs>
                        <RadialGradient
                            id="loginGlowTopRight"
                            cx={width * 0.85}
                            cy={height * 0.04}
                            r={Math.max(width, height) * 0.55}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#a3e635" stopOpacity={0.34} />
                            <Stop offset="45%" stopColor="#84cc16" stopOpacity={0.12} />
                            <Stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                        </RadialGradient>
                        <RadialGradient
                            id="loginGlowBottomLeft"
                            cx={width * 0.1}
                            cy={height * 0.92}
                            r={Math.max(width, height) * 0.55}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#65a30d" stopOpacity={0.3} />
                            <Stop offset="50%" stopColor="#3f6212" stopOpacity={0.12} />
                            <Stop offset="100%" stopColor="#3f6212" stopOpacity={0} />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width={width} height={height} fill="url(#loginGlowTopRight)" />
                    <Rect x="0" y="0" width={width} height={height} fill="url(#loginGlowBottomLeft)" />
                </Svg>
            )}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentInsetAdjustmentBehavior="never"
                    automaticallyAdjustContentInsets={false}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: top + 16,
                        paddingBottom: bottom + 24,
                        paddingHorizontal: 24,
                    }}
                >
                    <View style={{ width: "100%", maxWidth: 448, alignSelf: "center" }}>
                        <View className="items-center">
                            <Image
                                source={
                                    theme === "dark"
                                        ? require("@/assets/icons/splash-icon-dark.png")
                                        : require("@/assets/icons/splash-icon-light.png")
                                }
                                style={{ width: 80, height: 80 }}
                                contentFit="contain"
                            />
                            <Text className="mt-5 text-4xl font-extrabold tracking-tight text-foreground">
                                WePickle
                            </Text>
                            <Text className="mt-2 text-base text-foreground-muted">
                                Your court. Your crew. Your game.
                            </Text>
                        </View>

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
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Popup
                isVisible={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                message={popupMessage}
            />
        </View>
    );
}
