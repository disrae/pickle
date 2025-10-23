import { useAuthActions } from "@convex-dev/auth/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, Text, TouchableOpacity, View } from "react-native";

export default function AuthVerify() {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [showDeepLinkPrompt, setShowDeepLinkPrompt] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const token = params.token as string;
                const email = params.email as string;

                if (!token) {
                    setError("Invalid verification link");
                    setIsProcessing(false);
                    return;
                }

                // On web, try to open the app via deep link
                if (Platform.OS === "web") {
                    const deepLink = `pickle://auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email || '')}`;

                    // Try to open the deep link
                    try {
                        window.location.href = deepLink;
                    } catch (e) {
                        console.log("Deep link attempt:", e);
                    }

                    // Show prompt after a delay
                    setTimeout(() => {
                        setShowDeepLinkPrompt(true);
                        setIsProcessing(false);
                    }, 2000);
                    return;
                }

                // On native, complete the sign-in
                await signIn("resend-otp", {
                    code: token,
                    ...(email && { email })
                });

                setIsProcessing(false);

                // Navigate to main app
                router.replace("/");
            } catch (err) {
                console.error("Authentication error:", err);
                setError("Authentication failed. Please try again.");
                setIsProcessing(false);
            }
        };

        void handleAuth();
    }, [params, signIn, router]);

    const handleOpenApp = () => {
        const token = params.token as string;
        const email = params.email as string;
        const deepLink = `pickle://auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email || '')}`;

        if (Platform.OS === "web") {
            window.location.href = deepLink;
        } else {
            Linking.openURL(deepLink);
        }
    };

    const handleTryAgain = () => {
        router.replace("/");
    };

    if (error) {
        return (
            <View className="flex-1 bg-lime-400 items-center justify-center px-6">
                <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center">
                    <Text className="text-6xl mb-4">❌</Text>
                    <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                        Oops!
                    </Text>
                    <Text className="text-slate-600 text-center mb-6">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={handleTryAgain}
                        className="bg-lime-500 rounded-xl px-8 py-4 w-full"
                    >
                        <Text className="text-white text-center font-bold text-base">
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (showDeepLinkPrompt) {
        return (
            <View className="flex-1 bg-lime-400 items-center justify-center px-6">
                <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center">
                    <Text className="text-6xl mb-4">🎾</Text>
                    <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                        Opening Pickle...
                    </Text>
                    <Text className="text-slate-600 text-center mb-6">
                        {Platform.OS === "web"
                            ? "If the app doesn't open automatically, click the button below."
                            : "Redirecting you to the app..."}
                    </Text>
                    <TouchableOpacity
                        onPress={handleOpenApp}
                        className="bg-lime-500 rounded-xl px-8 py-4 w-full mb-3"
                    >
                        <Text className="text-white text-center font-bold text-base">
                            Open Pickle App
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-slate-500 text-sm text-center">
                        Don't have the app? Download it first.
                    </Text>
                </View>
            </View>
        );
    }

    if (isProcessing) {
        return (
            <View className="flex-1 bg-lime-400 items-center justify-center">
                <ActivityIndicator size="large" color="#84cc16" />
                <Text className="mt-4 text-white text-lg font-semibold">
                    {Platform.OS === "web" ? "Opening app..." : "Signing you in..."}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-lime-400 items-center justify-center px-6">
            <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center">
                <Text className="text-6xl mb-4">✅</Text>
                <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                    {`You're in!`}
                </Text>
                <Text className="text-slate-600 text-center">
                    Welcome to Pickle 🎾
                </Text>
            </View>
        </View>
    );
}

