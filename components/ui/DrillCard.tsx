import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { GlassContainer } from "./GlassContainer";

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
    Beginner: "text-green-700",
    Intermediate: "text-yellow-700",
    Advanced: "text-orange-700",
    Expert: "text-red-700",
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
                    <View className="bg-surface-2 rounded-full px-2 py-1 mr-2">
                        <Text className="text-foreground text-xs font-medium tracking-wide">
                            {drill.category}
                        </Text>
                    </View>
                    <View
                        className={`rounded-full px-2 py-1 border ${difficultyColors[drill.difficulty] || "bg-surface-2 border-border"}`}
                    >
                        <Text className={`text-xs font-medium ${difficultyTextColors[drill.difficulty] || "text-foreground"}`}>
                            {drill.difficulty}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-semibold text-foreground flex-1">
                        {drill.title}
                    </Text>
                </View>

                {/* Description */}
                <Text className="text-foreground text-sm tracking-wide mb-2" numberOfLines={2}>
                    {drill.description}
                </Text>

                {/* Progress Bar */}
                {progress && completedCount > 0 && (
                    <View className="mb-2">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-foreground-muted text-xs">
                                {completedCount}/{totalMilestones} milestones
                            </Text>
                            {progress.personalBest && (
                                <Text className="text-brand-strong text-xs font-semibold">
                                    PB: {progress.personalBest}
                                </Text>
                            )}
                        </View>
                        <View className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-brand rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Creator */}
                {!drill.isOfficial && drill.creator && (
                    <Text className="text-foreground-muted text-xs">
                        by {drill.creator.name || drill.creator.email}
                    </Text>
                )}
            </View>

            {/* Arrow */}
            <View className="ml-2 justify-center">
                <Ionicons name="chevron-forward" size={20} color="#5c6454" />
            </View>
        </View>
    );

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
            <GlassContainer
                style={{
                    borderRadius: 16,
                    padding: 16,
                }}
            >
                {CardContent}
            </GlassContainer>
        </TouchableOpacity>
    );
}

