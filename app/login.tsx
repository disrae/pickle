import { Background } from "@/components/ui/Background";
import { Popup } from "@/components/ui/Popup";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useLoading } from "@/lib/loading-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const { top } = useSafeAreaInsets();
    const { signIn } = useAuthActions();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">("signIn");
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const { showLoading, hideLoading } = useLoading();

    // Control loading state
    const isLoadingUser = user === undefined;
    useEffect(() => {
        if (isLoadingUser) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoadingUser, showLoading, hideLoading]);

    // Redirect to authenticated area if user is already logged in
    if (user !== undefined && user !== null) {
        return <Redirect href="/(authenticated)/(tabs)" />;
    }

    // Don't render the form while loading
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

        try {
            await signIn("password", {
                email: email.trim().toLowerCase(),
                password,
                flow: passwordFlow,
            });
        } catch (error) {
            console.error("Password auth error:", error);
            showErrorPopup(error);
        }
    };

    const handleContinueAsGuest = () => {
        router.push("/(authenticated)/(tabs)/court");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-lime-400"
        >
            <Background>
                <Pressable className="flex-1" onPress={Platform.OS !== 'web' ? () => Keyboard.dismiss() : undefined}>
                    <View
                        className="flex-1 items-center gap-4"
                        style={{ paddingTop: top }}
                    >
                        {/* Login Form */}
                        <View className="flex-1 px-6 w-full max-w-md top-[25%] self-center">
                            <View
                                className="bg-white/95 px-6 py-8 w-full rounded-3xl"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 16,
                                    elevation: 8,
                                }}
                            >
                                <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
                                    WePickle
                                </Text>
                                <Text className="text-slate-500 text-center mb-8">
                                    Sign in to continue
                                </Text>

                                <StyledInput
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                />

                                <View className="h-8" />

                                <View className="flex-row bg-slate-100 rounded-xl p-1 mb-4">
                                    <Pressable
                                        onPress={() => setPasswordFlow("signIn")}
                                        className={`flex-1 py-2 rounded-lg ${passwordFlow === "signIn" ? "bg-white" : ""}`}
                                    >
                                        <Text className={`text-center font-semibold ${passwordFlow === "signIn" ? "text-slate-800" : "text-slate-500"}`}>
                                            Sign In
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setPasswordFlow("signUp")}
                                        className={`flex-1 py-2 rounded-lg ${passwordFlow === "signUp" ? "bg-white" : ""}`}
                                    >
                                        <Text className={`text-center font-semibold ${passwordFlow === "signUp" ? "text-slate-800" : "text-slate-500"}`}>
                                            Sign Up
                                        </Text>
                                    </Pressable>
                                </View>
                                <StyledInput
                                    label="Password"
                                    placeholder={passwordFlow === "signUp" ? "Create a password (min 8 chars)" : "Enter your password"}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    autoComplete="password"
                                    textContentType="password"
                                />
                                <View className="h-8" />
                                <StyledButton
                                    onPress={handlePasswordAuth}
                                    title={passwordFlow === "signUp" ? "Create account" : "Sign in"}
                                    variant="primary"
                                />

                                <View className="h-4" />

                                <View className="flex-row items-center">
                                    <View className="flex-1 h-px bg-slate-300" />
                                    <Text className="text-slate-500 px-4">or</Text>
                                    <View className="flex-1 h-px bg-slate-300" />
                                </View>

                                <View className="h-4" />

                                <StyledButton
                                    onPress={handleContinueAsGuest}
                                    title="Continue as Guest"
                                    variant="secondary"
                                />

                                <Text className="text-slate-500 text-center mt-3 text-xs">
                                    Guest mode is read-only. Sign in to unlock all features.
                                </Text>

                            </View>
                        </View>
                    </View>
                </Pressable>
            </Background>

            <Popup
                isVisible={showPopup}
                onClose={() => setShowPopup(false)}
                title={popupTitle}
                message={popupMessage}
            />
        </KeyboardAvoidingView>
    );
}
