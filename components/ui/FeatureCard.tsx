import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { GlassContainer } from "./GlassContainer";

interface FeatureCardProps {
    feature: {
        _id: Id<"featureRequests">;
        title: string;
        description: string;
        category: string;
        voteCount: number;
        userHasVoted: boolean;
        isPreset: boolean;
        creator: { 
            _id: Id<"users">;
            name?: string; 
            email?: string;
            isAdmin?: boolean;
        } | null;
    };
}

const categoryColors: Record<string, string> = {
    "Gameplay": "bg-blue-500/10 border-blue-400",
    "Social": "bg-purple-500/10 border-purple-400",
    "Training": "bg-green-500/10 border-green-400",
    "UI/UX": "bg-yellow-500/10 border-yellow-400",
    "Other": "bg-slate-500/10 border-slate-400",
};

const categoryTextColors: Record<string, string> = {
    "Gameplay": "text-blue-300",
    "Social": "text-purple-300",
    "Training": "text-green-300",
    "UI/UX": "text-yellow-300",
    "Other": "text-slate-300",
};

export function FeatureCard({ feature }: FeatureCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleVote = useMutation(api.featureRequests.toggleVote);
    const deleteFeature = useMutation(api.featureRequests.deleteFeature);
    const currentUser = useQuery(api.users.currentUser);

    const handleVoteToggle = async () => {
        setIsVoting(true);
        try {
            await toggleVote({ featureRequestId: feature._id });
        } catch (error) {
            console.error("Vote toggle error:", error);
        } finally {
            setIsVoting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteFeature({ featureRequestId: feature._id });
        } catch (error) {
            console.error("Delete error:", error);
            setIsDeleting(false);
        }
    };

    const canDelete = currentUser && feature.creator && (
        currentUser._id === feature.creator._id || currentUser.isAdmin === true
    );

    return (
        <GlassContainer
            style={{
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
            }}
        >
            <View className="flex-row items-start">
                {/* Content */}
                <View className="flex-1">
                    {/* Category Tag */}
                    <View className="flex-row items-center mb-2">
                        <View
                            className={`rounded-full px-2 py-1 border ${categoryColors[feature.category] || categoryColors.Other}`}
                        >
                            <Text className={`text-xs font-medium ${categoryTextColors[feature.category] || categoryTextColors.Other}`}>
                                {feature.category}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-lg font-semibold text-slate-200 mb-1">
                        {feature.title}
                    </Text>

                    {/* Description */}
                    <TouchableOpacity 
                        onPress={() => setIsExpanded(!isExpanded)}
                        activeOpacity={0.7}
                    >
                        <Text className="text-slate-300 text-sm mb-1" numberOfLines={isExpanded ? undefined : 3}>
                            {feature.description}
                        </Text>
                        {feature.description.length > 100 && (
                            <Text className="text-lime-400 text-xs font-medium">
                                {isExpanded ? "Show less" : "Read more"}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <View className="mb-2" />

                    {/* Creator */}
                    {!feature.isPreset && feature.creator && (
                        <Text className="text-slate-500 text-xs mb-2">
                            suggested by {feature.creator.name || feature.creator.email}
                        </Text>
                    )}
                </View>

                {/* Right side: Vote button and delete */}
                <View className="ml-3 items-end justify-start">
                    {/* Vote Button */}
                    <TouchableOpacity
                        onPress={handleVoteToggle}
                        disabled={isVoting}
                        className={`items-center justify-center px-3 py-2 rounded-lg min-w-[60px] ${
                            feature.userHasVoted 
                                ? "bg-lime-500/20 border-2 border-lime-400" 
                                : "bg-slate-700/60 border-2 border-slate-600"
                        }`}
                        activeOpacity={0.7}
                    >
                        {isVoting ? (
                            <ActivityIndicator size="small" color="#84cc16" />
                        ) : (
                            <>
                                <Ionicons
                                    name={feature.userHasVoted ? "checkmark-circle" : "arrow-up-circle-outline"}
                                    size={24}
                                    color={feature.userHasVoted ? "#84cc16" : "#cbd5e1"}
                                />
                                <Text className={`text-xs font-bold mt-1 ${
                                    feature.userHasVoted ? "text-lime-400" : "text-slate-300"
                                }`}>
                                    {feature.voteCount}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Delete Button */}
                    {canDelete && !feature.isPreset && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={isDeleting}
                            className="mt-2 p-2"
                            activeOpacity={0.7}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </GlassContainer>
    );
}

