import { Background } from "@/components/ui/Background";
import { CreateDrillCard } from "@/components/ui/CreateDrillCard";
import { DrillCard } from "@/components/ui/DrillCard";
import { DrillDetailCard } from "@/components/ui/DrillDetailCard";
import { Header } from "@/components/ui/header";
import { TrainingFAB } from "@/components/ui/TrainingFAB";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function DrillsScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDrillId, setSelectedDrillId] = useState<Id<"drills"> | null>(null);

    // Fetch all drills once
    const allDrills = useQuery(api.drills.list, {});

    // const stats = useQuery(api.drillProgress.getUserStats);
    const allProgress = useQuery(api.drillProgress.getAllUserProgress);

    // Create progress lookup for drill cards
    const progressLookup: Record<string, any> = {};
    if (allProgress) {
        allProgress.forEach((p) => {
            progressLookup[p.drillId] = p;
        });
    }

    // Create Fuse instance for fuzzy search
    const fuse = useMemo(() => {
        if (!allDrills) return null;
        return new Fuse(allDrills, {
            keys: ['title', 'description'],
            threshold: 0.4, // Lower = more strict matching
            includeScore: true,
        });
    }, [allDrills]);

    // Filter drills on client side
    const drills = useMemo(() => {
        if (!allDrills) return [];

        let filteredDrills = allDrills;

        // Category filter
        if (selectedCategories.length > 0) {
            filteredDrills = filteredDrills.filter(drill =>
                selectedCategories.includes(drill.category)
            );
        }

        // Difficulty filter
        if (selectedDifficulties.length > 0) {
            filteredDrills = filteredDrills.filter(drill =>
                selectedDifficulties.includes(drill.difficulty)
            );
        }

        // Search filter with Fuse.js
        if (searchTerm && fuse) {
            const searchResults = fuse.search(searchTerm);
            const searchDrillIds = new Set(searchResults.map(result => result.item._id));
            filteredDrills = filteredDrills.filter(drill =>
                searchDrillIds.has(drill._id)
            );
        }

        return filteredDrills;
    }, [allDrills, selectedCategories, selectedDifficulties, searchTerm, fuse]);

    const handleDrillPress = (drillId: Id<"drills">) => {
        setSelectedDrillId(drillId);
        setShowDetailModal(true);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const toggleDifficulty = (difficulty: string) => {
        setSelectedDifficulties(prev => {
            if (prev.includes(difficulty)) {
                return prev.filter(d => d !== difficulty);
            } else {
                return [...prev, difficulty];
            }
        });
    };

    const headerHeight = top + 100;

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
                    {/* Category Filter - Full Width */}
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
                                className={`rounded-full px-5 py-2.5 mr-2 border ${selectedCategories.includes(category) ? "bg-lime-400 border-lime-300" : "bg-black/60 border-slate-600/50"}`}
                                style={selectedCategories.includes(category) ? {
                                    shadowColor: '#84cc16',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 10,
                                    elevation: 8,
                                } : {}}
                            >
                                <Text
                                    className={`font-semibold ${selectedCategories.includes(category) ? "text-black" : "text-slate-200"}`}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Difficulty Filter - Full Width */}
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
                                className={`rounded-full px-5 py-2.5 mr-2 border ${selectedDifficulties.includes(difficulty) ? "bg-lime-400 border-lime-300" : "bg-black/60 border-slate-600/50"}`}
                                style={selectedDifficulties.includes(difficulty) ? {
                                    shadowColor: '#84cc16',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 10,
                                    elevation: 8,
                                } : {}}
                            >
                                <Text
                                    className={`font-semibold ${selectedDifficulties.includes(difficulty) ? "text-black" : "text-slate-200"}`}
                                >
                                    {difficulty}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Content with horizontal padding */}
                    <View className="px-4">
                        {/* Progress Overview */}
                        {/* <LiquidGlassCard>
                        <Text className="text-lg font-bold text-slate-200 mb-4">
                            This Week
                        </Text>

                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-400">
                                    {stats?.drillsCompleted || 0}
                                </Text>
                                <Text className="text-slate-300 text-sm mt-1">Drills</Text>
                            </View>
                            <View className="h-full w-px bg-slate-600" />
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-400">
                                    {stats?.minutesPracticed || 0}
                                </Text>
                                <Text className="text-slate-300 text-sm mt-1">Minutes</Text>
                            </View>
                            <View className="h-full w-px bg-slate-600" />
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-400">
                                    {stats?.sessionsThisWeek || 0}
                                </Text>
                                <Text className="text-slate-300 text-sm mt-1">Sessions</Text>
                            </View>
                        </View>
                    </LiquidGlassCard> */}

                        {/* Search Bar */}
                        <View className="bg-black/60 rounded-2xl px-4 py-3 mb-4 flex-row items-center border border-slate-600/50">
                            <Ionicons name="search" size={20} color="#cbd5e1" />
                            <TextInput
                                className="flex-1 ml-2 text-slate-200"
                                placeholder="Search drills..."
                                placeholderTextColor="#94a3b8"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                            {searchTerm !== "" && (
                                <TouchableOpacity onPress={() => setSearchTerm("")}>
                                    <Ionicons name="close-circle" size={20} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Drills Section */}
                        {/* <Text className="text-xl tracking wide font-bold text-slate-800 mb-3">
                            {searchTerm ? "Search Results" : "All Drills"}
                        </Text> */}

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
                            <View className="bg-black/60 rounded-2xl p-8 items-center border border-slate-600/50">
                                <Ionicons name="fitness-outline" size={48} color="#cbd5e1" />
                                <Text className="text-slate-300 text-center mt-4">
                                    {searchTerm
                                        ? "No drills found matching your search"
                                        : "No drills available yet"}
                                </Text>
                                {!searchTerm && (
                                    <TouchableOpacity
                                        onPress={() => setShowCreateModal(true)}
                                        className="mt-4 bg-lime-500 rounded-full px-6 py-3"
                                    >
                                        <Text className="text-white font-semibold">
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
