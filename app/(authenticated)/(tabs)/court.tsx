import { ChallengeSheet } from "@/components/compete/ChallengeSheet";
import { CoachPromptBanner } from "@/components/coach/CoachPromptBanner";
import { CourtEmptyActions, CourtHero } from "@/components/court/CourtHero";
import { LocationCheckInPrompt } from "@/components/court/LocationCheckInPrompt";
import { Background } from "@/components/ui/Background";
import { CourtSelectorPopup } from "@/components/ui/CourtSelectorPopup";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { TimePickerPopup } from "@/components/ui/TimePickerPopup";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@/lib/header-layout";
import { useLocationCheckIn } from "@/lib/use-location-check-in";
import { PicklePaddle } from "@/assets/icons/picklepaddle";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourtsScreen() {
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCourtSelector, setShowCourtSelector] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isHeadedThere, setIsHeadedThere] = useState(false);
    const [isReportingLineup, setIsReportingLineup] = useState(false);
    const [isReportingCondition, setIsReportingCondition] = useState(false);
    const [challengeOpponentId, setChallengeOpponentId] = useState<Id<"users"> | null>(null);

    const court = useQuery(api.courts.getDefault);
    const currentCheckIn = useQuery(api.checkIns.getCurrentUserCheckIn);
    const checkIns = useQuery(
        api.checkIns.getCurrentCheckIns,
        court ? { courtId: court._id } : "skip"
    );
    const presence = useQuery(
        api.checkIns.getCourtPresenceSummary,
        court ? { courtId: court._id } : "skip"
    );
    const plannedVisits = useQuery(
        api.plannedVisits.getForCourt,
        court ? { courtId: court._id } : "skip"
    );
    const isCourtDry = useQuery(
        api.courts.isCourtDry,
        court ? { courtId: court._id } : "skip"
    );
    const isLineupValid = useQuery(
        api.courts.isLineupValid,
        court ? { courtId: court._id } : "skip"
    );
    const lineupReporter = useQuery(
        api.courts.getLineupReporter,
        court?.lineupReportedBy ? { userId: court.lineupReportedBy } : "skip"
    );
    const conditionReporter = useQuery(
        api.courts.getConditionReporter,
        court?.courtReportedDryBy ? { userId: court.courtReportedDryBy } : "skip"
    );

    useLocationCheckIn(court?._id);

    const checkInMut = useMutation(api.checkIns.checkIn);
    const checkOutMut = useMutation(api.checkIns.checkOut);
    const createPlannedVisit = useMutation(api.plannedVisits.create);
    const headedToCourt = useMutation(api.plannedVisits.headedToCourt);
    const deletePlannedVisit = useMutation(api.plannedVisits.deleteVisit);
    const reportLineup = useMutation(api.courts.reportLineup);
    const reportCourtDry = useMutation(api.courts.reportCourtDry);

    const handleCheckIn = async (isPrivate = false) => {
        if (!court) return;
        setIsCheckingIn(true);
        try {
            await checkInMut({ courtId: court._id, isPrivate });
        } catch (error) {
            console.error("Check-in error:", error);
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setIsCheckingOut(true);
        try {
            await checkOutMut();
        } catch (error) {
            console.error("Check-out error:", error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handleSelectTime = async (timestamp: number) => {
        if (!court) return;
        try {
            await createPlannedVisit({ courtId: court._id, plannedTime: timestamp, notifyRegulars: true });
        } catch (error) {
            console.error("Plan visit error:", error);
        }
    };

    const handleHeadedThere = async () => {
        if (!court) return;
        setIsHeadedThere(true);
        try {
            await headedToCourt({ courtId: court._id });
        } catch (error) {
            console.error("Headed there error:", error);
        } finally {
            setIsHeadedThere(false);
        }
    };

    const handleDeletePlan = async (visitId: string) => {
        try {
            await deletePlannedVisit({ visitId: visitId as any });
        } catch (error) {
            console.error("Delete plan error:", error);
        }
    };

    const handleReportLineup = async (lineupCount: number) => {
        if (!court) return;
        setIsReportingLineup(true);
        try {
            await reportLineup({ courtId: court._id, lineupCount });
        } catch (error) {
            console.error("Report lineup error:", error);
        } finally {
            setIsReportingLineup(false);
        }
    };

    const handleReportCourtDry = async () => {
        if (!court) return;
        setIsReportingCondition(true);
        try {
            await reportCourtDry({ courtId: court._id });
        } catch (error) {
            console.error("Report court dry error:", error);
        } finally {
            setIsReportingCondition(false);
        }
    };

    const formatPlannedTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        let dayLabel = "";
        if (slotDate.getTime() === today.getTime()) dayLabel = "Today";
        else if (slotDate.getTime() === tomorrow.getTime()) dayLabel = "Tomorrow";
        else dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        const hours = date.getHours();
        const mins = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMins = mins.toString().padStart(2, "0");
        return `${dayLabel} at ${displayHours}:${displayMins} ${ampm}`;
    };

    const formatReportTime = (timestamp: number) => {
        const diffMins = Math.floor((Date.now() - timestamp) / (1000 * 60));
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        return `${Math.floor(diffMins / 60)}h ago`;
    };

    const groupedVisits = plannedVisits?.reduce((acc, visit) => {
        const timeKey = visit.plannedTime;
        if (!acc[timeKey]) acc[timeKey] = [];
        acc[timeKey].push(visit);
        return acc;
    }, {} as Record<number, typeof plannedVisits>) || {};

    const sortedTimeSlots = Object.keys(groupedVisits).map(Number).sort((a, b) => a - b);
    const isCheckedIn = !!currentCheckIn;
    const hereCount = presence?.hereNow ?? checkIns?.length ?? 0;
    const comingCount = presence?.comingSoon ?? plannedVisits?.length ?? 0;
    const isEmptyCourt = hereCount === 0;

    if (court === undefined) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#a3e635" />
                </View>
            </Background>
        );
    }

    if (!court && Boolean(user)) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="location-outline" size={92} color="#a3e635" />
                    <Text className="text-foreground text-2xl font-bold mt-6 text-center">Pick your home court</Text>
                    <Text className="text-muted-foreground text-base mt-2 text-center">
                        Queen Elizabeth or Jericho Beach — see who&apos;s playing.
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowCourtSelector(true)}
                        className="mt-10 bg-brand px-8 py-4 rounded-2xl"
                    >
                        <Text className="text-brand-foreground text-lg font-bold">Browse courts</Text>
                    </TouchableOpacity>
                </View>
                <CourtSelectorPopup isVisible={showCourtSelector} onClose={() => setShowCourtSelector(false)} />
                <LocationCheckInPrompt />
            </Background>
        );
    }

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: Platform.OS === "web" ? 100 : Math.max(bottom, isLiquidGlassAvailable() ? 80 : 32),
                }}
            >
                <CoachPromptBanner />

                <CourtHero
                    hereCount={hereCount}
                    comingCount={comingCount}
                    checkIns={checkIns ?? []}
                    currentUserId={user?._id}
                    isCheckedIn={isCheckedIn}
                    isCheckingIn={isCheckingIn}
                    isCheckingOut={isCheckingOut}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    onPlayerPress={(id) => router.push(`/profile/${id}`)}
                    onChallenge={(id) => setChallengeOpponentId(id)}
                />

                {isEmptyCourt && (
                    <CourtEmptyActions
                        onHeadedThere={handleHeadedThere}
                        onPlanVisit={() => setShowTimePicker(true)}
                        isLoading={isHeadedThere}
                    />
                )}

                {/* Lineup — secondary */}
                <GlassContainer style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}>
                    <Text className="text-muted-foreground text-xs font-semibold uppercase mb-3">Lineup</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {Array.from({ length: 8 }, (_, i) => {
                            const n = i + 1;
                            const filled = isLineupValid && court?.currentLineupCount !== undefined && n <= court.currentLineupCount;
                            const selected = isLineupValid && court?.currentLineupCount === n;
                            return isCheckedIn ? (
                                <TouchableOpacity key={i} onPress={() => handleReportLineup(selected ? 0 : n)} disabled={isReportingLineup}>
                                    <PicklePaddle width={28} height={28} tintColor={filled ? "#b8ff48" : "#555"} />
                                </TouchableOpacity>
                            ) : (
                                <PicklePaddle key={i} width={28} height={28} tintColor={filled ? "#b8ff48" : "#555"} />
                            );
                        })}
                    </View>
                    {isLineupValid && court?.currentLineupCount && lineupReporter && (
                        <Text className="text-muted-foreground text-sm mt-2">
                            {court.currentLineupCount} court(s) — {lineupReporter.name} {court.lineupReportedAt && formatReportTime(court.lineupReportedAt)}
                        </Text>
                    )}
                    {isCourtDry && conditionReporter && court?.courtReportedDryAt && (
                        <Text className="text-muted-foreground text-sm mt-2">
                            Reported dry — {conditionReporter.name} {formatReportTime(court.courtReportedDryAt)}
                        </Text>
                    )}
                    {isCheckedIn && !isCourtDry && (
                        <TouchableOpacity onPress={handleReportCourtDry} disabled={isReportingCondition} className="mt-3">
                            <Text className="text-destructive text-sm">Report court dry</Text>
                        </TouchableOpacity>
                    )}
                </GlassContainer>

                {/* Who's coming */}
                <GlassContainer style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-foreground">Who&apos;s coming</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-row items-center px-3 py-1.5 rounded-lg border border-brand">
                            <Ionicons name="add-circle-outline" size={18} color="#a3e635" />
                            <Text className="text-brand text-sm font-semibold ml-1">Plan</Text>
                        </TouchableOpacity>
                    </View>
                    {sortedTimeSlots.length > 0 ? (
                        sortedTimeSlots.map((timeSlot) => (
                            <View key={timeSlot} className="mb-4">
                                <Text className="text-brand text-sm font-semibold mb-2">{formatPlannedTime(timeSlot)}</Text>
                                {groupedVisits[timeSlot].map((visit) => {
                                    const isUserPlan = visit.userId === user?._id;
                                    return (
                                        <View key={visit._id} className="flex-row items-center py-2 pl-2">
                                            <TouchableOpacity
                                                onPress={() => !isUserPlan && router.push(`/profile/${visit.user._id}`)}
                                                disabled={isUserPlan}
                                                className="flex-1"
                                            >
                                                <Text className={`text-foreground ${isUserPlan ? "font-semibold" : ""}`}>
                                                    {isUserPlan ? "You" : visit.user.name || visit.user.email}
                                                </Text>
                                            </TouchableOpacity>
                                            {isUserPlan && (
                                                <TouchableOpacity onPress={() => handleDeletePlan(visit._id)}>
                                                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))
                    ) : (
                        <Text className="text-muted-foreground text-center py-4">No upcoming plans</Text>
                    )}
                </GlassContainer>

                <TouchableOpacity onPress={() => router.push("/players")} activeOpacity={0.7}>
                    <GlassContainer style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}>
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="people" size={24} color="#a3e635" />
                            <Text className="text-lg font-bold text-foreground ml-3">Browse players</Text>
                        </View>
                    </GlassContainer>
                </TouchableOpacity>
            </ScrollView>

            <Header
                title={court?.name || ""}
                rightButton="chat"
                onRightPress={() => router.push(`/chats/${court?._id || ""}`)}
                onTitlePress={() => setShowCourtSelector(true)}
            />

            <TimePickerPopup isVisible={showTimePicker} onClose={() => setShowTimePicker(false)} onSelectTime={handleSelectTime} />
            <CourtSelectorPopup isVisible={showCourtSelector} onClose={() => setShowCourtSelector(false)} currentCourtId={court?._id} />

            {court && challengeOpponentId && (
                <ChallengeSheet
                    isVisible={!!challengeOpponentId}
                    onClose={() => setChallengeOpponentId(null)}
                    preselectedOpponentId={challengeOpponentId}
                    courtId={court._id}
                />
            )}

            <LocationCheckInPrompt />
        </Background>
    );
}
