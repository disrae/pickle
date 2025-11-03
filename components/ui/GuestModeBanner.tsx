import { useRouter } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GuestModeBannerProps {
    isVisible: boolean;
}

export function GuestModeBanner({ isVisible }: GuestModeBannerProps) {
    const { top } = useSafeAreaInsets();
    const router = useRouter();

    if (!isVisible) return null;

    return (
        <View
            className="bg-amber-500 absolute top-0 left-0 right-0 pb-2 px-4 z-10"
            style={{ paddingTop: top }}
        >
            {Platform.OS === 'web' && <View className="h-2" />}
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-amber-900 font-semibold text-sm">
                        Read-only mode - Sign in for full access
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        // Dismiss all stacks and navigate to root
                        router.dismissAll();
                        router.replace('/login');
                    }}
                    className="bg-amber-900 px-3 py-2 rounded-lg ml-3"
                    activeOpacity={0.8}
                >
                    <Text className="text-amber-50 text-sm font-semibold">
                        Sign In
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
