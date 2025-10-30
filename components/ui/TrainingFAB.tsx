import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
import { useEffect } from "react";

interface TrainingFABProps {
    onPress: () => void;
}

export function TrainingFAB({ onPress }: TrainingFABProps) {
    const scale = useSharedValue(0);

    useEffect(() => {
        // Animate in on mount
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: 24,
                    right: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                },
                animatedStyle,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                className="bg-lime-500 rounded-full w-16 h-16 items-center justify-center"
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
}

