import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect } from "react";
import { Platform, TouchableOpacity } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface TrainingFABProps {
    onPress: () => void;
}

export function TrainingFAB({ onPress }: TrainingFABProps) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        // Subtle pulse animation - only run once on mount
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000 }),
                withTiming(1, { duration: 2000 })
            ),
            -1, // infinite repeat
            true // reverse
        );

        // Pulsing glow effect
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 2000 }),
                withTiming(0.3, { duration: 2000 })
            ),
            -1, // infinite repeat
            true // reverse
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const baseStyle = {
            transform: [{ scale: scale.value }],
        };

        // Only add shadow properties on non-web platforms
        if (Platform.OS !== 'web') {
            return {
                ...baseStyle,
                shadowOpacity: glowOpacity.value,
                shadowRadius: 6 + (glowOpacity.value * 6), // Dynamic radius for glow effect
            };
        }

        return baseStyle;
    });

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: isLiquidGlassAvailable() ? 90 : 16,
                    right: 24,
                    ...(Platform.OS !== 'web' && {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 4,
                    }),
                },
                animatedStyle,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                className="bg-lime-500 rounded-full w-16 h-16 items-center justify-center"
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#000000" />
            </TouchableOpacity>
        </Animated.View>
    );
}

