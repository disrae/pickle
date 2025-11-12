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
    const [emailSent, setEmailSent] = useState(false);
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

    const handleSendLoginLink = async () => {
        Keyboard.dismiss();

        if (!email.trim()) return;

        try {
            await signIn("resend-otp", {
                email: email.trim().toLowerCase(),
            });
            setEmailSent(true);
            // Navigate to verification screen
            // router.push("/auth/verify");
        } catch (error) {
            console.error("Sign in error:", error);
            setPopupTitle("Error");
            setPopupMessage("Failed to send email. Please try again.");
            setShowPopup(true);
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
                                />

                                <View className="h-8" />

                                <StyledButton
                                    onPress={handleSendLoginLink}
                                    title={emailSent ? "Email Sent ✓" : "Send login link"}
                                    variant={emailSent ? "success" : "primary"}
                                    disabled={emailSent}
                                />

                                {emailSent && (
                                    <Text className="text-slate-600 text-center mt-4 text-sm">
                                        Check your email for a login link. It could be in your spam folder.
                                    </Text>
                                )}

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

                                {/* Test verification */}
                                {/* <View className="h-8" />
                <StyledButton
                  onPress={() => router.push("/auth/verify?token=55688520&email=danny.israel@gmail.com")}
                  title="Test verification"
                /> */}

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
