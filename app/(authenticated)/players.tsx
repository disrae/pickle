import { ChatBackground } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];

type UserWithProgress = {
    _id: Id<"users">;
    name?: string;
    email?: string;
    image?: Id<"_storage">;
    skillProgress: Record<string, number>;
    profileImageUrl?: string | null;
    isCheckedIn: boolean;
    hasPlans: boolean;
};

export default function PlayersScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    // Queries
    const currentUser = useQuery(api.users.currentUser);
    const allUsers = useQuery(api.users.listAllUsers);
    const allDrills = useQuery(api.drills.list, {});
    const checkIns = useQuery(api.checkIns.getCurrentCheckIns, 
        currentUser?.selectedCourtId ? { courtId: currentUser.selectedCourtId } : "skip"
    );
    const plannedVisits = useQuery(api.plannedVisits.getForCourt,
        currentUser?.selectedCourtId ? { courtId: currentUser.selectedCourtId } : "skip"
    );

    // Get all user progress and profile images
    const usersWithData = useMemo(() => {
        if (!allUsers || !allDrills) return [];

        return allUsers.map(user => {
            // Note: We can't call useQuery in a loop, so we'll need to fetch this differently
            // For now, we'll return basic data and handle images separately
            return {
                ...user,
                skillProgress: {},
                profileImageUrl: null,
                isCheckedIn: checkIns?.some(c => c.userId === user._id) || false,
                hasPlans: plannedVisits?.some(p => p.userId === user._id) || false,
            };
        });
    }, [allUsers, allDrills, checkIns, plannedVisits]);

    // Create Fuse instance for fuzzy search
    const fuse = useMemo(() => {
        if (!usersWithData) return null;
        return new Fuse(usersWithData, {
            keys: ['name', 'email'],
            threshold: 0.4,
            includeScore: true,
        });
    }, [usersWithData]);

    // Filter and search users
    const filteredUsers = useMemo(() => {
        if (!usersWithData) return [];

        let filtered = usersWithData;

        // Apply filters
        if (selectedFilters.includes("Checked In Now")) {
            filtered = filtered.filter(u => u.isCheckedIn);
        }
        if (selectedFilters.includes("Has Plans")) {
            filtered = filtered.filter(u => u.hasPlans);
        }

        // Apply search
        if (searchTerm && fuse) {
            const searchResults = fuse.search(searchTerm);
            const searchUserIds = new Set(searchResults.map(result => result.item._id));
            filtered = filtered.filter(user => searchUserIds.has(user._id));
        }

        return filtered;
    }, [usersWithData, selectedFilters, searchTerm, fuse]);

    const toggleFilter = (filter: string) => {
        setSelectedFilters(prev => {
            if (prev.includes(filter)) {
                return prev.filter(f => f !== filter);
            } else {
                return [...prev, filter];
            }
        });
    };

    const headerHeight = top + 60;

    return (
        <ChatBackground>
            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingTop: headerHeight,
                        paddingBottom: Math.max(bottom, 32),
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Search Bar */}
                    <View className="px-4 mb-4">
                        <View className="bg-black/60 rounded-2xl px-4 py-3 flex-row items-center border border-slate-600/50">
                            <Ionicons name="search" size={20} color="#cbd5e1" />
                            <TextInput
                                className="flex-1 ml-2 text-slate-200"
                                placeholder="Search players..."
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
                    </View>

                    {/* Filter Pills */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {["Checked In Now", "Has Plans"].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => toggleFilter(filter)}
                                className={`rounded-full px-5 py-2.5 mr-2 border ${selectedFilters.includes(filter) ? "bg-lime-400 border-lime-300" : "bg-black/60 border-slate-600/50"}`}
                                style={selectedFilters.includes(filter) ? {
                                    shadowColor: '#84cc16',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 10,
                                    elevation: 8,
                                } : {}}
                            >
                                <Text
                                    className={`font-semibold ${selectedFilters.includes(filter) ? "text-black" : "text-slate-200"}`}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Player List */}
                    <View className="px-4">
                        {!allUsers ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#84cc16" />
                            </View>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <PlayerCard
                                    key={user._id}
                                    user={user}
                                    onPress={() => router.push(`/profile/${user._id}`)}
                                />
                            ))
                        ) : (
                            <View className="bg-black/60 rounded-2xl p-8 items-center border border-slate-600/50">
                                <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                                <Text className="text-slate-300 text-center mt-4">
                                    {searchTerm || selectedFilters.length > 0
                                        ? "No players found matching your search"
                                        : "No players available"}
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            <Header
                title="Browse Players"
                rightButton="back"
                onRightPress={() => router.back()}
                user={currentUser}
            />
        </ChatBackground>
    );
}

// Player Card Component
function PlayerCard({ user, onPress }: { user: UserWithProgress; onPress: () => void }) {
    const profileImageUrl = useQuery(api.users.getUserProfileImageUrl, { userId: user._id });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassContainer
                style={{
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                }}
            >
                <View className="flex-row items-center">
                    {/* Profile Image */}
                    <View className="w-16 h-16 rounded-full bg-slate-600 items-center justify-center mr-4">
                        {profileImageUrl ? (
                            <Image
                                source={{ uri: profileImageUrl }}
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                }}
                                contentFit="cover"
                            />
                        ) : (
                            <Text className="text-2xl font-bold text-slate-200">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                            </Text>
                        )}
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                        <Text className="text-slate-200 font-bold text-lg">
                            {user?.name || "Pickle Player"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            {user.isCheckedIn && (
                                <View className="flex-row items-center mr-3">
                                    <Ionicons name="checkmark-circle" size={14} color="#84cc16" />
                                    <Text className="text-lime-400 text-xs tracking-wide ml-1">Checked In</Text>
                                </View>
                            )}
                            {user.hasPlans && (
                                <View className="flex-row items-center">
                                    <Ionicons name="time" size={14} color="#60a5fa" />
                                    <Text className="text-blue-400 text-xs tracking-wide ml-1">Has Plans</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Mini Radar Chart */}
                    <View className="ml-2">
                        <Ionicons name="chevron-forward" size={20} color="#eee" />
                    </View>
                </View>
            </GlassContainer>
        </TouchableOpacity>
    );
}
