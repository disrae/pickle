import { Background } from "@/components/ui/Background";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourtsScreen() {
    const { top } = useSafeAreaInsets();
    const user = useQuery(api.users.currentUser);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Refetch data
        setTimeout(() => setRefreshing(false), 1000);
    };

    const headerHeight = top + 100;

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingTop: headerHeight }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={headerHeight}
                    />
                }
            >
                {/* Currently at Courts Section */}
                <View className="bg-white/95 rounded-3xl p-6 mb-4 shadow-lg">
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        🎾 Currently at Courts
                    </Text>

                    {/* TODO: Replace with actual data */}
                    <View className="items-center py-8">
                        <Text className="text-slate-400 text-center">
                            No one is currently checked in
                        </Text>
                        <Text className="text-slate-400 text-center text-sm mt-2">
                            Be the first to check in!
                        </Text>
                    </View>
                </View>
                <View className="bg-white/95 rounded-3xl p-6 mb-4 shadow-lg">
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        🎾 Currently at Courts
                    </Text>

                    {/* TODO: Replace with actual data */}
                    <View className="items-center py-8">
                        <Text className="text-slate-400 text-center">
                            No one is currently checked in
                        </Text>
                        <Text className="text-slate-400 text-center text-sm mt-2">
                            Be the first to check in!
                        </Text>
                    </View>
                </View>
                <View className="bg-white/95 rounded-3xl p-6 mb-4 shadow-lg">
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        🎾 Currently at Courts
                    </Text>

                    {/* TODO: Replace with actual data */}
                    <View className="items-center py-8">
                        <Text className="text-slate-400 text-center">
                            No one is currently checked in
                        </Text>
                        <Text className="text-slate-400 text-center text-sm mt-2">
                            Be the first to check in!
                        </Text>
                    </View>
                </View>

                {/* Planning to Go Section */}
                <View className="bg-white/95 rounded-3xl p-6 shadow-lg">
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        📅 Planning to Go
                    </Text>

                    {/* TODO: Replace with actual data */}
                    <View className="items-center py-8">
                        <Ionicons name="time-outline" size={48} color="#cbd5e1" />
                        <Text className="text-slate-400 text-center mt-4">
                            No upcoming plans yet
                        </Text>
                        <Text className="text-slate-400 text-center text-sm mt-2">
                            Schedule your next game!
                        </Text>
                    </View>
                </View>

                {/* Quick Actions - Placeholder for future features */}
                <View className="mt-6 bg-lime-400/20 rounded-2xl p-4 border-2 border-lime-400">
                    <Text className="text-slate-600 text-center text-sm">
                        💡 Coming soon: Check in, schedule games, and see real-time court availability
                    </Text>
                </View>
            </ScrollView>

            <Header title="Jericho Pickle Courts" />

        </Background>
    );
}

