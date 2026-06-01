import { ChallengeSheet } from "@/components/compete/ChallengeSheet";
import { NewTeamSheet } from "@/components/compete/NewTeamSheet";
import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { Popup } from "@/components/ui/Popup";
import { RadarChart } from "@/components/ui/RadarChart";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { hasNotificationPermissions, requestNotificationPermissions } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useHeaderHeight } from "@/lib/header-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];

function opponentLabel(
    match: {
        format: "doubles" | "singles";
        p1Id: Id<"users">;
        p2Id?: Id<"users">;
        player1?: { name?: string; email?: string } | null;
        player3?: { name?: string; email?: string } | null;
    },
    userId: Id<"users">
) {
    const isP1Side = match.p1Id === userId || match.p2Id === userId;
    const opp = isP1Side ? match.player3 : match.player1;
    return opp?.name || opp?.email?.split("@")[0] || "Opponent";
}

function scoreLabel(
    match: { p1Id: Id<"users">; p2Id?: Id<"users">; score1: number; score2: number },
    userId: Id<"users">
) {
    const isP1Side = match.p1Id === userId || match.p2Id === userId;
    const myScore = isP1Side ? match.score1 : match.score2;
    const theirScore = isP1Side ? match.score2 : match.score1;
    return `${myScore}–${theirScore}`;
}

function formatMatchDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PlayerProfileScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { id } = useLocalSearchParams<{ id: string; }>();
    const userId = id as Id<"users">;

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
    const [showChallenge, setShowChallenge] = useState(false);
    const [showNewTeam, setShowNewTeam] = useState(false);

    // Queries
    const currentUser = useQuery(api.users.currentUser);
    const profileUser = useQuery(api.users.getUserById, { userId });
    const profileImageUrl = useQuery(api.users.getUserProfileImageUrl, { userId });
    const defaultCourt = useQuery(api.courts.getDefault);
    const userProgress = useQuery(api.drillProgress.getUserProgressByUserId, { userId });
    const allDrills = useQuery(api.drills.list, {});
    const notificationSettings = useQuery(api.userNotificationSettings.getNotificationSettings, { targetUserId: userId });
    const blockStatus = useQuery(api.blockedUsers.getUserBlockStatus, { targetUserId: userId });
    const matches = useQuery(api.challenges.matchHistory, { userId });

    // Mutations
    const toggleCheckInNotif = useMutation(api.userNotificationSettings.toggleCheckInNotification);
    const togglePlannedVisitNotif = useMutation(api.userNotificationSettings.togglePlannedVisitNotification);
    const blockUser = useMutation(api.blockedUsers.blockUser);
    const unblockUser = useMutation(api.blockedUsers.unblockUser);
    const saveExpoPushToken = useMutation(api.users.saveExpoPushToken);

    // Calculate skill progress per category
    const skillProgress = useMemo(() => {
        if (!allDrills || !userProgress) {
            return {};
        }

        const progressByCategory: Record<string, { completed: number; total: number }> = {};

        // Initialize all categories
        CATEGORIES.forEach(category => {
            progressByCategory[category] = { completed: 0, total: 0 };
        });

        // Count drills and completions per category
        allDrills.forEach(drill => {
            if (progressByCategory[drill.category]) {
                progressByCategory[drill.category].total++;

                // Check if drill has any completed milestones
                const drillProgress = userProgress.find(p => p.drillId === drill._id);
                if (drillProgress && drillProgress.completedMilestones.length > 0) {
                    // Weight completion by milestone completion percentage
                    const completionRate = drillProgress.completedMilestones.length / drill.milestones.length;
                    progressByCategory[drill.category].completed += completionRate;
                }
            }
        });

        // Convert to percentages
        const percentages: Record<string, number> = {};
        Object.entries(progressByCategory).forEach(([category, data]) => {
            percentages[category] = data.total > 0 ? (data.completed / data.total) * 100 : 0;
        });

        return percentages;
    }, [allDrills, userProgress]);

    const handleNotificationToggle = async (toggleFn: () => Promise<any>) => {
        // Check if permissions are granted
        const hasPermissions = await hasNotificationPermissions();
        
        if (!hasPermissions) {
            setIsRequestingPermissions(true);
            const token = await requestNotificationPermissions();
            setIsRequestingPermissions(false);
            
            if (!token) {
                setPopupMessage("Notification permissions are required to receive updates. Please enable them in your device settings.");
                setPopupVisible(true);
                return;
            }
            
            // Save token to backend
            await saveExpoPushToken({ token });
        }
        
        // Toggle the notification setting
        await toggleFn();
    };

    const handleBlockToggle = async () => {
        if (blockStatus?.isBlocked) {
            await unblockUser({ blockedUserId: userId });
        } else {
            await blockUser({ blockedUserId: userId });
        }
    };


    if (!profileUser || !currentUser) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#84cc16" />
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <View className="flex-1">
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(bottom, 32) }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header Section */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <View className="items-center">
                            {/* Profile Image */}
                            <View className="w-32 h-32 rounded-full bg-slate-600 items-center justify-center">
                                {profileImageUrl ? (
                                    <Image
                                        source={{ uri: profileImageUrl }}
                                        style={{
                                            width: 128,
                                            height: 128,
                                            borderRadius: 64,
                                        }}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <Text className="text-6xl font-bold text-white">
                                        {profileUser?.name?.[0]?.toUpperCase() || profileUser?.email?.[0]?.toUpperCase() || "?"}
                                    </Text>
                                )}
                            </View>

                            {/* Name */}
                            <Text className="text-3xl font-bold text-slate-200 mt-4">
                                {profileUser?.name || "Pickle Player"}
                            </Text>
                        </View>
                    </GlassContainer>

                    {/* Challenge + Team CTAs (other user only) */}
                    {currentUser?._id !== userId && (
                        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowChallenge(true)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    backgroundColor: "rgba(245,158,11,0.15)",
                                    borderWidth: 1,
                                    borderColor: "rgba(245,158,11,0.35)",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                <Ionicons name="trophy" size={16} color="#f59e0b" />
                                <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 14 }}>
                                    Challenge
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowNewTeam(true)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.1)",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                <Ionicons name="people" size={16} color="#9ca3af" />
                                <Text style={{ color: "#9ca3af", fontWeight: "700", fontSize: 14 }}>
                                    Invite to Team
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Skill Profile Section */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="stats-chart" size={20} color="#a3e635" />
                            <Text className="text-xl font-bold text-slate-200 ml-2">
                                Skill Profile
                            </Text>
                        </View>

                        <RadarChart skillProgress={skillProgress} size={280} />
                    </GlassContainer>

                    {/* Match History */}
                    {matches && matches.length > 0 && (
                        <GlassContainer
                            style={{
                                borderRadius: 24,
                                padding: 24,
                                marginBottom: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <Ionicons name="trophy" size={20} color="#f59e0b" />
                                    <Text className="text-xl font-bold text-slate-200 ml-2">
                                        Match History
                                    </Text>
                                </View>
                                <Text className="text-slate-400 text-sm">
                                    {matches.filter((m) => m.won).length}W–
                                    {matches.filter((m) => !m.won).length}L
                                </Text>
                            </View>

                            {matches.slice(0, 10).map((match) => (
                                <View
                                    key={match._id}
                                    className="flex-row items-center py-3 border-t border-slate-600/50"
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: match.won
                                                ? "rgba(245, 158, 11, 0.15)"
                                                : "rgba(255,255,255,0.05)",
                                            marginRight: 12,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: match.won ? "#f59e0b" : "#9ca3af",
                                                fontWeight: "800",
                                                fontSize: 12,
                                            }}
                                        >
                                            {match.won ? "W" : "L"}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-200 font-semibold">
                                            vs {opponentLabel(match, userId)}
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-0.5">
                                            {match.format === "doubles" ? "Doubles" : "Singles"} ·{" "}
                                            {formatMatchDate(match.confirmedAt ?? match.reportedAt)}
                                        </Text>
                                    </View>
                                    <Text className="text-slate-200 font-bold">
                                        {scoreLabel(match, userId)}
                                    </Text>
                                </View>
                            ))}
                        </GlassContainer>
                    )}

                    {/* Notifications Section */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="notifications" size={20} color="#a3e635" />
                            <Text className="text-xl font-bold text-slate-200 ml-2">
                                Notifications
                            </Text>
                        </View>

                        {isRequestingPermissions ? (
                            <View className="py-4 items-center">
                                <ActivityIndicator size="small" color="#84cc16" />
                                <Text className="text-slate-300 text-sm mt-2">
                                    Requesting permissions...
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Check-in notification toggle */}
                                <View className="flex-row items-center justify-between py-3 border-b border-slate-600/50">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-slate-200 font-semibold">
                                            Notify me when {profileUser?.name || "they"} checks in
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-1">
                                            Get notified when this player arrives at a court
                                        </Text>
                                    </View>
                                    <Switch
                                        value={notificationSettings?.notifyOnCheckIn || false}
                                        onValueChange={() => handleNotificationToggle(() => toggleCheckInNotif({ targetUserId: userId }))}
                                        trackColor={{ false: "#334155", true: "#84cc16" }}
                                        thumbColor={notificationSettings?.notifyOnCheckIn ? "#65a30d" : "#94a3b8"}
                                    />
                                </View>

                                {/* Planned visit notification toggle */}
                                <View className="flex-row items-center justify-between py-3 border-b border-slate-600/50">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-slate-200 font-semibold">
                                            Notify me when {profileUser?.name || "they"} plans a visit
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-1">
                                            Get notified when this player schedules a court time
                                        </Text>
                                    </View>
                                    <Switch
                                        value={notificationSettings?.notifyOnPlannedVisit || false}
                                        onValueChange={() => handleNotificationToggle(() => togglePlannedVisitNotif({ targetUserId: userId }))}
                                        trackColor={{ false: "#334155", true: "#84cc16" }}
                                        thumbColor={notificationSettings?.notifyOnPlannedVisit ? "#65a30d" : "#94a3b8"}
                                    />
                                </View>

                                {/* Block user toggle */}
                                <View className="flex-row items-center justify-between py-3">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-slate-200 font-semibold">
                                            Block {profileUser?.name || "this player"} from seeing my activity
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-1">
                                            They won&apos;t see your check-ins or plans (and you won&apos;t see theirs)
                                        </Text>
                                    </View>
                                    <Switch
                                        value={blockStatus?.isBlocked || false}
                                        onValueChange={handleBlockToggle}
                                        trackColor={{ false: "#334155", true: "#ef4444" }}
                                        thumbColor={blockStatus?.isBlocked ? "#dc2626" : "#94a3b8"}
                                    />
                                </View>
                            </>
                        )}
                    </GlassContainer>
                </ScrollView>
            </View>

            <Header
                title={profileUser?.name || "Player Profile"}
                rightButton="back"
                onRightPress={() => router.back()}
                user={currentUser}
            />

            <Popup
                isVisible={popupVisible}
                onClose={() => setPopupVisible(false)}
                title="Permission Required"
                message={popupMessage}
            />

            {defaultCourt && (
                <ChallengeSheet
                    isVisible={showChallenge}
                    onClose={() => setShowChallenge(false)}
                    preselectedOpponentId={userId}
                    courtId={defaultCourt._id}
                />
            )}

            <NewTeamSheet
                isVisible={showNewTeam}
                onClose={() => setShowNewTeam(false)}
                courtId={defaultCourt?._id}
                preselectedPartnerId={userId}
            />
        </Background>
    );
}
