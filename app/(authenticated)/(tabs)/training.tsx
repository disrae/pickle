import { Background } from "@/components/ui/Background";
import { CreateDrillModal } from "@/components/ui/CreateDrillModal";
import { DrillCard } from "@/components/ui/DrillCard";
import { DrillDetailModal } from "@/components/ui/DrillDetailModal";
import { Header } from "@/components/ui/header";
import { TrainingFAB } from "@/components/ui/TrainingFAB";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["All", "Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

export default function TrainingScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDrillId, setSelectedDrillId] = useState<Id<"drills"> | null>(null);

    // Fetch data
    const drills = useQuery(
        api.drills.list,
        {
            category: selectedCategory === "All" ? undefined : selectedCategory,
            difficulty: selectedDifficulty === "All" ? undefined : selectedDifficulty,
            searchTerm: searchTerm || undefined,
        }
    );

    const stats = useQuery(api.drillProgress.getUserStats);
    const allProgress = useQuery(api.drillProgress.getAllUserProgress);

    // Create progress lookup for drill cards
    const progressLookup: Record<string, any> = {};
    if (allProgress) {
        allProgress.forEach((p) => {
            progressLookup[p.drillId] = p;
        });
    }

    const handleDrillPress = (drillId: Id<"drills">) => {
        setSelectedDrillId(drillId);
        setShowDetailModal(true);
    };

    const headerHeight = top + 100;

    const LiquidGlassCard = ({ children, style }: { children: React.ReactNode; style?: any; }) => {
        if (isLiquidGlassAvailable()) {
            return (
                <GlassView
                    glassEffectStyle="clear"
                    style={{
                        borderRadius: 24,
                        padding: 24,
                        marginBottom: 16,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        ...style,
                    }}
                >
                    {children}
                </GlassView>
            );
        } else if (Platform.OS === "android") {
            return (
                <View
                    style={{
                        borderRadius: 24,
                        padding: 24,
                        marginBottom: 16,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        ...style,
                    }}
                >
                    {children}
                </View>
            );
        } else {
            return (
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={{
                        borderRadius: 24,
                        padding: 24,
                        marginBottom: 16,
                        overflow: "hidden",
                        ...style,
                    }}
                >
                    {children}
                </BlurView>
            );
        }
    };

    return (
        <Background>
            <View className="flex-1">
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{
                        paddingTop: headerHeight,
                        paddingBottom: Math.max(bottom, 32) + 80,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress Overview */}
                    <LiquidGlassCard>
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
                    </LiquidGlassCard>

                    {/* Search Bar */}
                    <View className="bg-white/95 rounded-2xl px-4 py-3 mb-4 flex-row items-center shadow-sm">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-2 text-slate-800"
                            placeholder="Search drills..."
                            placeholderTextColor="#94a3b8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm !== "" && (
                            <TouchableOpacity onPress={() => setSearchTerm("")}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Category Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                    >
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                                className={`rounded-full px-4 py-2 mr-2 ${selectedCategory === category ? "bg-lime-500" : "bg-white/95"}`}
                            >
                                <Text
                                    className={`font-medium ${selectedCategory === category ? "text-white" : "text-slate-700"}`}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Difficulty Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                    >
                        {DIFFICULTIES.map((difficulty) => (
                            <TouchableOpacity
                                key={difficulty}
                                onPress={() => setSelectedDifficulty(difficulty)}
                                className={`rounded-full px-4 py-2 mr-2 ${selectedDifficulty === difficulty ? "bg-lime-500" : "bg-white/95"}`}
                            >
                                <Text
                                    className={`font-medium ${selectedDifficulty === difficulty ? "text-white" : "text-slate-700"}`}
                                >
                                    {difficulty}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Drills Section */}
                    <Text className="text-xl font-bold text-slate-200 mb-3">
                        {searchTerm ? "Search Results" : "All Drills"}
                    </Text>

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
                        <View className="bg-white/95 rounded-2xl p-8 items-center">
                            <Ionicons name="fitness-outline" size={48} color="#94a3b8" />
                            <Text className="text-slate-500 text-center mt-4">
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
                </ScrollView>
            </View>

            <Header
                title="Training & Drills"
                titleSize="text-2xl"
                rightButton="chat"
                onRightPress={() => router.push("/training/chats")}
            />

            <TrainingFAB onPress={() => setShowCreateModal(true)} />

            <CreateDrillModal
                isVisible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            <DrillDetailModal
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
