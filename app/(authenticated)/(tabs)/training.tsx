import { Background } from "@/components/ui/Background";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingScreen() {
    const { top } = useSafeAreaInsets();
    const user = useQuery(api.users.currentUser);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Refetch data
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Sample drill categories - to be replaced with actual data
    const drillCategories = [
        { id: 1, title: "Serve Drills", icon: "🎯", count: 8 },
        { id: 2, title: "Dinking Practice", icon: "🏓", count: 12 },
        { id: 3, title: "Volley Drills", icon: "⚡", count: 10 },
        { id: 4, title: "Footwork", icon: "👟", count: 6 },
    ];

    return (
        <Background>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View
                    className="px-6 pb-6"
                    style={{ paddingTop: top + 20 }}
                >
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-slate-800">
                            Training & Drills
                        </Text>
                        <Text className="text-slate-500 mt-1">
                            Improve your game with targeted practice
                        </Text>
                    </View>

                    {/* Progress Overview */}
                    <View className="bg-white/95 rounded-3xl p-6 mb-4 shadow-lg">
                        <Text className="text-lg font-bold text-slate-800 mb-4">
                            📊 This Week
                        </Text>

                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Drills</Text>
                            </View>
                            <View className="h-full w-px bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Minutes</Text>
                            </View>
                            <View className="h-full w-px bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Sessions</Text>
                            </View>
                        </View>
                    </View>

                    {/* Drill Categories */}
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        Drill Categories
                    </Text>

                    {drillCategories.map((category) => (
                        <View
                            key={category.id}
                            className="bg-white/95 rounded-2xl p-5 mb-3 shadow"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-3xl mr-3">{category.icon}</Text>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-slate-800">
                                            {category.title}
                                        </Text>
                                        <Text className="text-slate-500 text-sm">
                                            {category.count} drills available
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-lime-100 rounded-full p-2">
                                    <Ionicons name="play" size={20} color="#65a30d" />
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Placeholder Info */}
                    <View className="mt-6 bg-lime-400/20 rounded-2xl p-4 border-2 border-lime-400">
                        <Text className="text-slate-600 text-center text-sm">
                            💡 Coming soon: Video tutorials, progress tracking, and personalized training plans
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </Background>
    );
}

