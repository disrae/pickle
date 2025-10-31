import { ReactNode, useEffect } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface BottomSheetCardProps {
    isVisible: boolean;
    onClose: () => void;
    children: ReactNode;
    maxHeight?: string;
}

export function BottomSheetCard({
    isVisible,
    onClose,
    children,
    maxHeight = "85%",
}: BottomSheetCardProps) {
    // Gesture handling
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    // Reset position when modal opens
    useEffect(() => {
        if (isVisible) {
            translateY.value = 0;
        }
    }, [isVisible, translateY]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            // Only allow dragging down
            translateY.value = Math.max(0, event.translationY + context.value.y);
        })
        .onEnd((event) => {
            // If dragged down more than 150px or velocity is high, close the modal
            if (translateY.value > 150 || event.velocityY > 500) {
                runOnJS(onClose)();
            } else {
                // Otherwise snap back
                translateY.value = withSpring(0, { damping: 50 });
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    className="flex-1 justify-end bg-black/0"
                >
                    <Animated.View
                        className="bg-white rounded-t-3xl"
                        style={[
                            { maxHeight: maxHeight as any, backgroundColor: "white" },
                            rBottomSheetStyle,
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {/* Drag Handle - Only this area responds to pan gestures */}
                        <GestureDetector gesture={gesture}>
                            <View className="items-center pt-3 pb-2">
                                <View className="w-12 h-1 bg-slate-300 rounded-full" />
                            </View>
                        </GestureDetector>

                        {children}
                    </Animated.View>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

