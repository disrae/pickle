import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface DrillCardProps {
    drill: {
        _id: string;
        title: string;
        description: string;
        category: string;
        difficulty: string;
        isOfficial: boolean;
        creator: { name?: string; email?: string; } | null;
        milestones: { count: number; description: string; }[];
    };
    progress?: {
        completedMilestones: number[];
        personalBest?: number;
    };
    onPress: () => void;
}

const difficultyColors: Record<string, string> = {
    Beginner: "bg-green-500/10 border-green-400",
    Intermediate: "bg-yellow-500/10 border-yellow-400",
    Advanced: "bg-orange-500/10 border-orange-400",
    Expert: "bg-red-500/10 border-red-400",
};

const difficultyTextColors: Record<string, string> = {
    Beginner: "text-green-300",
    Intermediate: "text-yellow-300",
    Advanced: "text-orange-300",
    Expert: "text-red-300",
};

export function DrillCard({ drill, progress, onPress }: DrillCardProps) {
    const completedCount = progress?.completedMilestones.length || 0;
    const totalMilestones = drill.milestones.length;
    const progressPercentage =
        totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;

    const CardContent = (
        <View className="flex-row items-start">
            {/* Content */}
            <View className="flex-1">
                {/* Category and Difficulty Tags */}
                <View className="flex-row items-center mb-2">
                    <View className="bg-slate-700/80 rounded-full px-2 py-1 mr-2">
                        <Text className="text-slate-100 text-xs font-medium tracking-wide">
                            {drill.category}
                        </Text>
                    </View>
                    <View
                        className={`rounded-full px-2 py-1 border ${difficultyColors[drill.difficulty] || "bg-slate-700/80 border-slate-600"}`}
                    >
                        <Text className={`text-xs font-medium ${difficultyTextColors[drill.difficulty] || "text-slate-200"}`}>
                            {drill.difficulty}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-semibold text-slate-200 flex-1">
                        {drill.title}
                    </Text>
                </View>

                {/* Description */}
                <Text className="text-slate-200 text-sm tracking-wide mb-2" numberOfLines={2}>
                    {drill.description}
                </Text>

                {/* Progress Bar */}
                {progress && completedCount > 0 && (
                    <View className="mb-2">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-slate-400 text-xs">
                                {completedCount}/{totalMilestones} milestones
                            </Text>
                            {progress.personalBest && (
                                <Text className="text-lime-400 text-xs font-semibold">
                                    PB: {progress.personalBest}
                                </Text>
                            )}
                        </View>
                        <View className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-lime-500 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Creator */}
                {!drill.isOfficial && drill.creator && (
                    <Text className="text-slate-500 text-xs">
                        by {drill.creator.name || drill.creator.email}
                    </Text>
                )}
            </View>

            {/* Arrow */}
            <View className="ml-2 justify-center">
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>
        </View>
    );

    if (isLiquidGlassAvailable()) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
                <GlassView
                    glassEffectStyle="clear"
                    style={{
                        borderRadius: 16,
                        padding: 16,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                    }}
                >
                    {CardContent}
                </GlassView>
            </TouchableOpacity>
        );
    } else if (Platform.OS === "android") {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="bg-black/60 rounded-2xl p-4 mb-3"
            >
                {CardContent}
            </TouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={{
                        borderRadius: 16,
                        padding: 16,
                        overflow: "hidden",
                    }}
                >
                    {CardContent}
                </BlurView>
            </TouchableOpacity>
        );
    }
}

