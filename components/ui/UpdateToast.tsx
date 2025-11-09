import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassContainer } from "./GlassContainer";

interface UpdateToastProps {
    isVisible: boolean;
    onPress: () => void;
    onDismiss: () => void;
}

export function UpdateToast({ isVisible, onPress, onDismiss }: UpdateToastProps) {
    const { top } = useSafeAreaInsets();
    const translateY = useSharedValue(-200);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            // Slide down and fade in
            translateY.value = withTiming(top + 16, { duration: 400 });
            opacity.value = withTiming(1, { duration: 400 });

            // Auto-dismiss after 10 seconds
            const timer = setTimeout(() => {
                onDismiss();
            }, 10000);

            return () => clearTimeout(timer);
        } else {
            // Slide up and fade out
            translateY.value = withTiming(-200, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [isVisible, top, onDismiss]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top: 0,
                    left: 16,
                    right: 16,
                    zIndex: 9999,
                },
                animatedStyle,
            ]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <GlassContainer
                    // this needs to be dark
                    glassEffectStyle="regular"
                    style={{
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "rgba(132, 204, 22, 0.3)",
                    }}
                >
                    <View className="flex-row items-center">
                        {/* Icon */}
                        <View className="bg-lime-500/20 rounded-full p-2 mr-3">
                            <Ionicons name="cloud-download" size={24} color="#84cc16" />
                        </View>

                        {/* Content */}
                        <View className="flex-1">
                            <Text className="text-lime-400 font-bold text-lg">
                                Update Available
                            </Text>
                            <Text className="text-slate-300 text-sm mt-0.5">
                                Tap to update now
                            </Text>
                        </View>

                        {/* Close button */}
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onDismiss();
                            }}
                            className="ml-2 p-1"
                        >
                            <Ionicons name="close" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </GlassContainer>
            </TouchableOpacity>
        </Animated.View>
    );
}

