import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Popup } from "@/components/ui/Popup";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useLoading } from "@/lib/loading-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
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

export default function LoginScreen() {
    const { top, bottom } = useSafeAreaInsets();
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
        <Background>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                        <View className="items-center pt-2">
                            <Image
                                source={require("@/assets/icons/splash-icon-light.png")}
                                style={{ width: 80, height: 80 }}
                                contentFit="contain"
                            />
                            <Text className="mt-5 text-4xl font-display-bold tracking-tight text-foreground">
                                WePickle
                            </Text>
                            <Text className="mt-2 text-base text-muted-foreground">
                                Your court. Your crew. Your game.
                            </Text>
                        </View>

                        <GlassContainer style={{ marginTop: 36, borderRadius: 28, padding: 24 }}>
                            <View className="mb-6 flex-row rounded-2xl border border-border bg-background/50 p-1">
                                {(["signIn", "signUp"] as const).map((flow) => {
                                    const active = passwordFlow === flow;
                                    return (
                                        <Pressable
                                            key={flow}
                                            onPress={() => setPasswordFlow(flow)}
                                            className={`flex-1 rounded-xl py-2.5 ${active ? "bg-brand" : ""}`}
                                        >
                                            <Text
                                                className={`text-center font-bold ${active ? "text-brand-foreground" : "text-foreground"}`}
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
                        </GlassContainer>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Popup
                isVisible={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                message={popupMessage}
            />
        </Background>
    );
}
