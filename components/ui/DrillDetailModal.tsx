import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
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

interface DrillDetailModalProps {
    isVisible: boolean;
    onClose: () => void;
    drillId: Id<"drills"> | null;
}

const categoryIcons: Record<string, string> = {
    Serving: "🎯",
    Dinking: "🏓",
    "Drop Shot": "💧",
    Reset: "🔄",
    Volley: "⚡",
    Footwork: "👟",
};

const difficultyColors: Record<string, string> = {
    Beginner: "text-green-600",
    Intermediate: "text-yellow-600",
    Advanced: "text-orange-600",
    Expert: "text-red-600",
};

export function DrillDetailModal({
    isVisible,
    onClose,
    drillId,
}: DrillDetailModalProps) {
    const drill = useQuery(
        api.drills.get,
        drillId ? { drillId } : "skip"
    );
    const progress = useQuery(
        api.drillProgress.getUserProgress,
        drillId ? { drillId } : "skip"
    );

    const toggleMilestone = useMutation(api.drillProgress.toggleMilestone);
    const updatePersonalBest = useMutation(api.drillProgress.updatePersonalBest);

    const [pbValue, setPbValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!drill) {
        return null;
    }

    const icon = categoryIcons[drill.category] || "📋";
    const completedMilestones = progress?.completedMilestones || [];

    const handleToggleMilestone = async (index: number) => {
        if (!drillId) return;
        setIsSubmitting(true);
        try {
            await toggleMilestone({ drillId, milestoneIndex: index });
        } catch (error) {
            console.error("Failed to toggle milestone:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePB = async () => {
        if (!drillId || !pbValue) return;
        const value = parseInt(pbValue, 10);
        if (isNaN(value) || value <= 0) return;

        setIsSubmitting(true);
        try {
            await updatePersonalBest({ drillId, value });
            setPbValue("");
        } catch (error) {
            console.error("Failed to update PB:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <GestureDetector gesture={gesture}>
                        <Animated.View
                            className="bg-white rounded-t-3xl"
                            style={[{ maxHeight: '85%', backgroundColor: 'white' }, rBottomSheetStyle]}
                        >
                            {/* Drag Handle */}
                            <View className="items-center pt-3 pb-2">
                                <View className="w-12 h-1 bg-slate-300 rounded-full" />
                            </View>

                            {/* Header */}
                            <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-200">
                                <Text className="text-2xl">{icon}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="bg-slate-100 rounded-full p-2"
                                >
                                    <Ionicons name="close" size={24} color="#475569" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="px-6" style={{ maxHeight: '100%' }}>
                                {/* Title and Badge */}
                                <View className="flex-row items-start justify-between mt-4 mb-2">
                                    <Text className="text-2xl font-bold text-slate-800 flex-1 mr-2">
                                        {drill.title}
                                    </Text>
                                    {drill.isOfficial && (
                                        <View className="bg-lime-100 rounded-full px-3 py-1 flex-row items-center">
                                            <Ionicons
                                                name="shield-checkmark"
                                                size={14}
                                                color="#65a30d"
                                            />
                                            <Text className="text-lime-700 text-xs font-semibold ml-1">
                                                Official
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Category and Difficulty */}
                                <View className="flex-row items-center mb-4">
                                    <Text className="text-slate-600 font-medium mr-2">
                                        {drill.category}
                                    </Text>
                                    <Text className="text-slate-400">•</Text>
                                    <Text className={`font-semibold ml-2 ${difficultyColors[drill.difficulty] || "text-gray-600"}`}>
                                        {drill.difficulty}
                                    </Text>
                                </View>

                                {/* Description */}
                                <Text className="text-slate-700 leading-6 mb-6">
                                    {drill.description}
                                </Text>

                                {/* Metric Info */}
                                <View className="bg-slate-50 rounded-2xl p-4 mb-6">
                                    <Text className="text-slate-500 text-sm font-semibold mb-1">
                                        METRIC
                                    </Text>
                                    <Text className="text-slate-800 font-medium">
                                        {drill.metricDescription}
                                    </Text>
                                </View>

                                {/* Milestones */}
                                <Text className="text-lg font-bold text-slate-800 mb-3">
                                    Milestones
                                </Text>
                                {drill.milestones.map((milestone, index) => {
                                    const isCompleted = completedMilestones.includes(index);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleToggleMilestone(index)}
                                            disabled={isSubmitting}
                                            className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${isCompleted ? "bg-lime-50 border-lime-400" : "bg-slate-50 border-slate-50"}`}
                                        >
                                            <View
                                                className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${isCompleted ? "bg-lime-500 border-lime-500" : "border-slate-300"}`}
                                            >
                                                {isCompleted && (
                                                    <Ionicons name="checkmark" size={16} color="white" />
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <Text
                                                    className={`font-semibold ${isCompleted ? "text-lime-700" : "text-slate-800"}`}
                                                >
                                                    {milestone.description}
                                                </Text>
                                                <Text className="text-slate-500 text-sm">
                                                    Goal: {milestone.count}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Personal Best */}
                                <View className="mt-6 mb-4">
                                    <Text className="text-lg font-bold text-slate-800 mb-3">
                                        Personal Best
                                    </Text>
                                    {progress?.personalBest && (
                                        <View className="bg-lime-50 rounded-xl p-4 mb-3 border border-lime-200">
                                            <Text className="text-lime-600 text-sm font-semibold mb-1">
                                                CURRENT BEST
                                            </Text>
                                            <Text className="text-3xl font-bold text-lime-700">
                                                {progress.personalBest}
                                            </Text>
                                        </View>
                                    )}

                                    <View className="flex-row items-center">
                                        <TextInput
                                            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 mr-2"
                                            placeholder="Enter your score..."
                                            keyboardType="numeric"
                                            value={pbValue}
                                            onChangeText={setPbValue}
                                            editable={!isSubmitting}
                                        />
                                        <TouchableOpacity
                                            onPress={handleUpdatePB}
                                            disabled={!pbValue || isSubmitting}
                                            className={`rounded-xl px-6 py-3 ${!pbValue || isSubmitting ? "bg-slate-300" : "bg-lime-500"}`}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="white" />
                                            ) : (
                                                <Text className="text-white font-semibold">Log</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Creator Info */}
                                {!drill.isOfficial && drill.creator && (
                                    <View className="mt-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                        <Text className="text-slate-500 text-xs font-semibold mb-1">
                                            CREATED BY
                                        </Text>
                                        <Text className="text-slate-700">
                                            {drill.creator.name || drill.creator.email}
                                        </Text>
                                    </View>
                                )}

                                {/* Encouragement */}
                                <View className="bg-lime-400/20 rounded-2xl p-4 mb-6 border-2 border-lime-400">
                                    <Text className="text-slate-700 text-center font-medium">
                                        💪 Keep practicing and track your progress!
                                    </Text>
                                </View>
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

