import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface DrillCardProps {
    drill: {
        _id: string;
        title: string;
        description: string;
        category: string;
        difficulty: string;
        isOfficial: boolean;
        creator: { name?: string; email?: string } | null;
        milestones: Array<{ count: number; description: string }>;
    };
    progress?: {
        completedMilestones: number[];
        personalBest?: number;
    };
    onPress: () => void;
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
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-orange-100 text-orange-700",
    Expert: "bg-red-100 text-red-700",
};

export function DrillCard({ drill, progress, onPress }: DrillCardProps) {
    const icon = categoryIcons[drill.category] || "📋";
    const completedCount = progress?.completedMilestones.length || 0;
    const totalMilestones = drill.milestones.length;
    const progressPercentage =
        totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white/95 rounded-2xl p-4 mb-3 shadow-sm"
            activeOpacity={0.7}
        >
            <View className="flex-row items-start">
                {/* Icon */}
                <Text className="text-3xl mr-3">{icon}</Text>

                {/* Content */}
                <View className="flex-1">
                    {/* Title and Official Badge */}
                    <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-semibold text-slate-800 flex-1">
                            {drill.title}
                        </Text>
                        {drill.isOfficial && (
                            <View className="ml-2">
                                <Ionicons name="shield-checkmark" size={16} color="#65a30d" />
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <Text className="text-slate-600 text-sm mb-2" numberOfLines={2}>
                        {drill.description}
                    </Text>

                    {/* Category and Difficulty Tags */}
                    <View className="flex-row items-center mb-2">
                        <View className="bg-slate-100 rounded-full px-2 py-1 mr-2">
                            <Text className="text-slate-700 text-xs font-medium">
                                {drill.category}
                            </Text>
                        </View>
                        <View
                            className={`rounded-full px-2 py-1 ${difficultyColors[drill.difficulty] || "bg-gray-100 text-gray-700"}`}
                        >
                            <Text className={`text-xs font-medium ${difficultyColors[drill.difficulty]?.includes("text-") ? "" : "text-gray-700"}`}>
                                {drill.difficulty}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    {progress && completedCount > 0 && (
                        <View className="mb-2">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-slate-500 text-xs">
                                    {completedCount}/{totalMilestones} milestones
                                </Text>
                                {progress.personalBest && (
                                    <Text className="text-lime-600 text-xs font-semibold">
                                        PB: {progress.personalBest}
                                    </Text>
                                )}
                            </View>
                            <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-lime-500 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </View>
                        </View>
                    )}

                    {/* Creator */}
                    {!drill.isOfficial && drill.creator && (
                        <Text className="text-slate-400 text-xs">
                            by {drill.creator.name || drill.creator.email}
                        </Text>
                    )}
                </View>

                {/* Arrow */}
                <View className="ml-2 justify-center">
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

