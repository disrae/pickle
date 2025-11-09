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
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];

interface ProfileScreenProps {
    userId: Id<"users">;
}

export function ProfileScreen({ userId }: ProfileScreenProps) {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

    // Queries
    const currentUser = useQuery(api.users.currentUser);
    const profileUser = useQuery(api.users.getUserById, { userId });
    const profileImageUrl = useQuery(api.users.getUserProfileImageUrl, { userId });
    const userProgress = useQuery(api.drillProgress.getUserProgressByUserId, { userId });
    const allDrills = useQuery(api.drills.list, {});
    const notificationSettings = useQuery(api.userNotificationSettings.getNotificationSettings, { targetUserId: userId });
    const blockStatus = useQuery(api.blockedUsers.getUserBlockStatus, { targetUserId: userId });

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

    const headerHeight = top + 60;

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
                            <View className="w-32 h-32 rounded-full bg-lime-400 items-center justify-center">
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

                            {/* Email */}
                            <Text className="text-slate-400 text-sm mt-1">
                                {profileUser?.email || ""}
                            </Text>
                        </View>
                    </GlassContainer>

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
        </Background>
    );
}