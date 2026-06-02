import { Background } from "@/components/ui/Background";
import { CreateDrillCard } from "@/components/ui/CreateDrillCard";
import { DrillCard } from "@/components/ui/DrillCard";
import { DrillDetailCard } from "@/components/ui/DrillDetailCard";
import { Header } from "@/components/ui/header";
import { SkillRoadmapCard } from "@/components/ui/SkillRoadmapCard";
import { TrainingFAB } from "@/components/ui/TrainingFAB";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@/lib/header-layout";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function DrillsScreen() {
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const params = useLocalSearchParams<{ category?: string }>();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDrillId, setSelectedDrillId] = useState<Id<"drills"> | null>(null);

    useEffect(() => {
        const category = params.category;
        if (category && CATEGORIES.includes(category)) {
            setSelectedCategories([category]);
        }
    }, [params.category]);

    const allDrills = useQuery(api.drills.list, {});
    const allProgress = useQuery(api.drillProgress.getAllUserProgress);

    const progressLookup: Record<string, any> = {};
    if (allProgress) {
        allProgress.forEach((p) => {
            progressLookup[p.drillId] = p;
        });
    }

    const fuse = useMemo(() => {
        if (!allDrills) return null;
        return new Fuse(allDrills, {
            keys: ["title", "description"],
            threshold: 0.4,
            includeScore: true,
        });
    }, [allDrills]);

    const skillProgress = useMemo(() => {
        if (!allDrills || !allProgress) {
            return {};
        }

        const progressByCategory: Record<string, { completed: number; total: number }> = {};

        CATEGORIES.forEach((category) => {
            progressByCategory[category] = { completed: 0, total: 0 };
        });

        allDrills.forEach((drill) => {
            if (progressByCategory[drill.category]) {
                progressByCategory[drill.category].total++;

                const drillProgress = allProgress.find((p) => p.drillId === drill._id);
                if (drillProgress && drillProgress.completedMilestones.length > 0) {
                    const completionRate =
                        drillProgress.completedMilestones.length / drill.milestones.length;
                    progressByCategory[drill.category].completed += completionRate;
                }
            }
        });

        const percentages: Record<string, number> = {};
        Object.entries(progressByCategory).forEach(([category, data]) => {
            percentages[category] = data.total > 0 ? (data.completed / data.total) * 100 : 0;
        });

        return percentages;
    }, [allDrills, allProgress]);

    const drills = useMemo(() => {
        if (!allDrills) return [];

        let filteredDrills = allDrills;

        if (selectedCategories.length > 0) {
            filteredDrills = filteredDrills.filter((drill) =>
                selectedCategories.includes(drill.category)
            );
        }

        if (selectedDifficulties.length > 0) {
            filteredDrills = filteredDrills.filter((drill) =>
                selectedDifficulties.includes(drill.difficulty)
            );
        }

        if (searchTerm && fuse) {
            const searchResults = fuse.search(searchTerm);
            const searchDrillIds = new Set(searchResults.map((result) => result.item._id));
            filteredDrills = filteredDrills.filter((drill) => searchDrillIds.has(drill._id));
        }

        return filteredDrills;
    }, [allDrills, selectedCategories, selectedDifficulties, searchTerm, fuse]);

    const handleDrillPress = (drillId: Id<"drills">) => {
        setSelectedDrillId(drillId);
        setShowDetailModal(true);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((c) => c !== category);
            }
            return [...prev, category];
        });
    };

    const toggleDifficulty = (difficulty: string) => {
        setSelectedDifficulties((prev) => {
            if (prev.includes(difficulty)) {
                return prev.filter((d) => d !== difficulty);
            }
            return [...prev, difficulty];
        });
    };

    return (
        <Background>
            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingTop: headerHeight,
                        paddingBottom: Math.max(bottom, 32) + 80,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-4">
                        <SkillRoadmapCard skillProgress={skillProgress} />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => toggleCategory(category)}
                                className={`rounded-full px-5 py-2.5 mr-2 border ${selectedCategories.includes(category) ? "bg-brand border-brand" : "bg-surface-2 border-border"}`}
                                style={
                                    selectedCategories.includes(category)
                                        ? {
                                              shadowColor: "#3F7D20",
                                              shadowOffset: { width: 0, height: 0 },
                                              shadowOpacity: 0.6,
                                              shadowRadius: 10,
                                              elevation: 8,
                                          }
                                        : {}
                                }
                            >
                                <Text
                                    className={`font-semibold ${selectedCategories.includes(category) ? "text-brand-foreground" : "text-foreground"}`}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {DIFFICULTIES.map((difficulty) => (
                            <TouchableOpacity
                                key={difficulty}
                                onPress={() => toggleDifficulty(difficulty)}
                                className={`rounded-full px-5 py-2.5 mr-2 border ${selectedDifficulties.includes(difficulty) ? "bg-brand border-brand" : "bg-surface-2 border-border"}`}
                                style={
                                    selectedDifficulties.includes(difficulty)
                                        ? {
                                              shadowColor: "#3F7D20",
                                              shadowOffset: { width: 0, height: 0 },
                                              shadowOpacity: 0.6,
                                              shadowRadius: 10,
                                              elevation: 8,
                                          }
                                        : {}
                                }
                            >
                                <Text
                                    className={`font-semibold ${selectedDifficulties.includes(difficulty) ? "text-brand-foreground" : "text-foreground"}`}
                                >
                                    {difficulty}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="px-4">
                        <View className="bg-surface rounded-2xl px-4 py-3 mb-4 flex-row items-center border border-border">
                            <Ionicons name="search" size={20} color="#5c6454" />
                            <TextInput
                                className="flex-1 ml-2 text-foreground"
                                placeholder="Search drills..."
                                placeholderTextColor="#5c6454"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                            {searchTerm !== "" && (
                                <TouchableOpacity onPress={() => setSearchTerm("")}>
                                    <Ionicons name="close-circle" size={20} color="#5c6454" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {drills && drills.length > 0 ? (
                            drills.map((drill) => (
                                <DrillCard
                                    key={drill._id}
                                    drill={drill}
                                    progress={progressLookup[drill._id]}
                                    onPress={() => handleDrillPress(drill._id)}
                                />
                            ))
                        ) : (
                            <View className="bg-surface rounded-2xl p-8 items-center border border-border">
                                <Ionicons name="fitness-outline" size={48} color="#5c6454" />
                                <Text className="text-foreground text-center mt-4">
                                    {searchTerm
                                        ? "No drills found matching your search"
                                        : "No drills available yet"}
                                </Text>
                                {!searchTerm && (
                                    <TouchableOpacity
                                        onPress={() => setShowCreateModal(true)}
                                        className="mt-4 bg-brand rounded-full px-6 py-3"
                                    >
                                        <Text className="text-brand-foreground font-semibold">
                                            Create First Drill
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            <Header
                title="Drills"
                titleSize="text-2xl"
                leftButton="back"
                onLeftPress={() => router.back()}
                rightButton="chat"
                onRightPress={() => router.push("/training/chats")}
            />

            <TrainingFAB onPress={() => setShowCreateModal(true)} />

            <CreateDrillCard
                isVisible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            <DrillDetailCard
                isVisible={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedDrillId(null);
                }}
                drillId={selectedDrillId}
            />
        </Background>
    );
}
