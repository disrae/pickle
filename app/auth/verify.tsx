import { PickleballBouncing } from "@/assets/icons/pickleball-bouncing";
import { PickleballLoading } from "@/assets/icons/pickleball-loading";
import { Background } from "@/components/ui/Background";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";

export default function AuthVerify() {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [showDeepLinkPrompt, setShowDeepLinkPrompt] = useState(false);
    const hasProcessedAuth = useRef(false);
    // Add new state for success
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (hasProcessedAuth.current) return;
        hasProcessedAuth.current = true;

        const handleAuth = async () => {
            try {
                const token = params.token as string;
                const email = params.email as string;

                console.log("auth/verify", { token, email, pathname });

                if (!token) {
                    setError("Invalid verification link");
                    setIsProcessing(false);
                    return;
                }

                // Handle web-specific flow
                if (Platform.OS === "web") {
                    // Show prompt immediately with options
                    setShowDeepLinkPrompt(true);
                    setIsProcessing(false);
                    return;
                }

                // On native, complete the sign-in
                console.log("signing in with email", email, "and code", token);
                await signIn("resend-otp", {
                    email,
                    code: token,
                });

                setIsSuccess(true);
                setIsProcessing(false);

                // REMOVE the router.replace here
            } catch (err) {
                console.error("Authentication error:", err);
                setError("Authentication failed. Please try again.");
                setIsProcessing(false);
            }
        };

        void handleAuth();
    }, [params, signIn, router, pathname]);

    useEffect(() => {
        if (isSuccess) {
            console.log("Success state triggered, starting redirect timer");
            const timer = setTimeout(() => {
                console.log("Attempting redirect to /(authenticated)/(tabs)");
                router.replace("/(authenticated)/(tabs)");
            }, 1500);

            return () => {
                console.log("Cleaning up redirect timer");
                clearTimeout(timer);
            };
        }
    }, [isSuccess, router]);

    // Optionally, to wait for auth state:
    // const user = useQuery(api.users.currentUser);
    // useEffect(() => {
    //     if (isSuccess && user !== undefined && user !== null) {
    //         router.replace("/(authenticated)/(tabs)");
    //     }
    // }, [isSuccess, user, router]);

    // New function for continuing in browser
    const handleContinueInBrowser = async () => {
        try {
            const token = params.token as string;
            const email = params.email as string;

            await signIn("resend-otp", {
                email,
                code: token,
            });

            setIsSuccess(true);
            setShowDeepLinkPrompt(false);

            // REMOVE the router.replace here
        } catch (err) {
            console.error("Browser authentication error:", err);
            setError("Authentication failed in browser. Please try again.");
        }
    };

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
            <View className="flex-1 bg-lime-400">
                <Background>
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center gap-4">
                            <Text className="text-2xl font-medium">Something Went Wrong</Text>
                            <Text className="text-lg text-red-700 tracking-wide">
                                {error}
                            </Text>
                            <Text className="text-lg text-slate-800 ">
                                Login Links expire after 20 minutes and can only be used once.
                            </Text>
                            <Text className="text-lg text-slate-800 ">
                                You can try again or contact: <Link href="mailto:support@wepickle.win">support@wepickle.win</Link>
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
                </Background>
            </View>
        );
    }

    // Update prompt UI to include continue in browser button
    if (showDeepLinkPrompt) {
        return (
            <View className="flex-1 bg-lime-400">
                <Background>
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center">
                            <PickleballBouncing bounceHeight={4} duration={2500} />
                            <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                                Verify Your Login
                            </Text>
                            <Text className="text-slate-600 text-center mb-6">
                                Open in the Pickle app or continue here in your browser.
                            </Text>
                            <TouchableOpacity
                                onPress={handleOpenApp}
                                className="bg-lime-500 rounded-xl px-8 py-4 w-full mb-3"
                            >
                                <Text className="text-white text-center font-bold text-base">
                                    Continue in App
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleContinueInBrowser}
                                className="bg-lime-600 rounded-xl px-8 py-4 w-full mb-3"
                            >
                                <Text className="text-white text-center font-bold text-base">
                                    Continue in Browser
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-slate-500 text-sm text-center">
                                {`Don't have the app? Download it first.`}
                            </Text>
                        </View>
                    </View>
                </Background>
            </View>
        );
    }

    // Add success UI
    if (isSuccess) {
        return (
            <View className="flex-1 bg-lime-400">
                <Background>
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="bg-white/95 p-8 rounded-3xl max-w-md w-full items-center">
                            <Ionicons name="checkmark-circle" size={48} color="green" />
                            <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                                Success!
                            </Text>
                            <Text className="text-slate-600 text-center mb-6">
                                You&apos;re now signed in. Redirecting...
                            </Text>
                        </View>
                    </View>
                </Background>
            </View>
        );
    }

    if (!isProcessing) {
        return (
            <View className="flex-1 bg-lime-400">
                <Background>
                    <View className="flex-1 items-center justify-center px-6">
                        <PickleballLoading />
                        <Text className="mt-4 text-slate-800 text-2xl font-semibold">
                            {Platform.OS === "web" ? "Opening app..." : "Signing you in..."}
                        </Text>
                    </View>
                </Background>
            </View>
        );
    }

    // Remove the final return Redirect
}

