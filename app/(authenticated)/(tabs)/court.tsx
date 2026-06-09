import { ChallengeSheet } from "@/components/compete/ChallengeSheet";
import { CoachPromptBanner } from "@/components/coach/CoachPromptBanner";
import { CourtEmptyActions, CourtHero } from "@/components/court/CourtHero";
import { LocationCheckInPrompt } from "@/components/court/LocationCheckInPrompt";
import { Background } from "@/components/ui/Background";
import { CourtSelectorPopup } from "@/components/ui/CourtSelectorPopup";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { IconTile } from "@/components/ui/IconTile";
import { Popup } from "@/components/ui/Popup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TimePickerPopup } from "@/components/ui/TimePickerPopup";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@/lib/header-layout";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

function BusyMeter({ pct, color }: { pct: number; color: string }) {
    const w = useSharedValue(0);
    useEffect(() => {
        w.value = withTiming(pct, { duration: 600 });
    }, [pct, w]);
    const style = useAnimatedStyle(() => ({ width: `${w.value}%` }));
    return (
        <View className="h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: "rgba(18,23,15,0.06)" }}>
            <Animated.View style={[{ height: "100%", borderRadius: 999, backgroundColor: color }, style]} />
        </View>
    );
}

export default function CourtsScreen() {
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCourtSelector, setShowCourtSelector] = useState(false);
    const [showLineupInfo, setShowLineupInfo] = useState(false);
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

    const lineupSlots = court?.lineupSlots ?? 10;
    const lineupCount = court?.currentLineupCount ?? 0;
    const hasLineupReport = !!isLineupValid && court?.currentLineupCount !== undefined;
    const lineupStatus =
        lineupCount <= 0
            ? { label: "Courts open", sub: "No wait right now", color: "#3F7D20", tint: "#E8F3DC", ink: "#2E5C16" }
            : lineupCount <= 2
                ? { label: "Short wait", sub: `${lineupCount} ${lineupCount === 1 ? "group" : "groups"} waiting`, color: "#3F7D20", tint: "#E8F3DC", ink: "#2E5C16" }
                : lineupCount <= 4
                    ? { label: "Moderate wait", sub: `${lineupCount} groups waiting`, color: "#B45309", tint: "rgba(245,158,11,0.15)", ink: "#B45309" }
                    : { label: "Long wait", sub: `${lineupCount} groups waiting`, color: "#B45309", tint: "rgba(245,158,11,0.15)", ink: "#B45309" };
    const lineupFillPct = Math.min(lineupCount / 6, 1) * 100;

    if (court === undefined) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3F7D20" />
                </View>
            </Background>
        );
    }

    if (!court && Boolean(user)) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="location-outline" size={92} color="#3F7D20" />
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

                <Animated.View entering={FadeInDown.duration(450).springify().damping(18)}>
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
                </Animated.View>

                {isEmptyCourt && (
                    <Animated.View entering={FadeInDown.delay(80).duration(450).springify().damping(18)}>
                        <CourtEmptyActions
                            onHeadedThere={handleHeadedThere}
                            onPlanVisit={() => setShowTimePicker(true)}
                            isLoading={isHeadedThere}
                        />
                    </Animated.View>
                )}

                {/* Court status — live wait */}
                <Animated.View entering={FadeInDown.delay(120).duration(450).springify().damping(18)}>
                <GlassContainer style={{ padding: 20, marginBottom: 14 }}>
                    <SectionHeader
                        label="Court status"
                        onInfo={() => setShowLineupInfo(true)}
                        right={
                            hasLineupReport && lineupReporter && court?.lineupReportedAt ? (
                                <Text className="text-muted-foreground text-sm">
                                    {lineupReporter.name?.split(" ")[0] ?? "Someone"} · {formatReportTime(court.lineupReportedAt)}
                                </Text>
                            ) : undefined
                        }
                    />

                    {hasLineupReport ? (
                        <>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 pr-3">
                                    <Text className="text-foreground text-2xl font-display-bold">{lineupStatus.label}</Text>
                                    <Text className="text-muted-foreground text-base mt-0.5">{lineupStatus.sub}</Text>
                                </View>
                                <View
                                    className="w-14 h-14 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: lineupStatus.tint }}
                                >
                                    <Text className="font-display-bold text-2xl" style={{ color: lineupStatus.ink }}>
                                        {lineupCount}
                                    </Text>
                                </View>
                            </View>
                            <BusyMeter pct={lineupFillPct} color={lineupStatus.color} />
                        </>
                    ) : (
                        <View className="flex-row items-center">
                            <IconTile name="time-outline" tone="neutral" />
                            <View className="flex-1 ml-3">
                                <Text className="text-foreground text-lg font-bold">No recent report</Text>
                                <Text className="text-muted-foreground text-base mt-0.5">
                                    {isCheckedIn ? "Set the wait so others know what to expect." : "Check in to share the wait."}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isCheckedIn && (
                        <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-border">
                            <Text className="text-foreground text-base font-semibold">Groups in line</Text>
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        tap();
                                        handleReportLineup(Math.max(0, lineupCount - 1));
                                    }}
                                    disabled={isReportingLineup || lineupCount <= 0}
                                    className={`w-9 h-9 rounded-full items-center justify-center bg-surface-2 ${lineupCount <= 0 ? "opacity-40" : ""}`}
                                >
                                    <Ionicons name="remove" size={20} color="#12170f" />
                                </TouchableOpacity>
                                <Text className="font-display-bold text-xl text-foreground w-7 text-center">{lineupCount}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        tap();
                                        handleReportLineup(Math.min(lineupSlots, lineupCount + 1));
                                    }}
                                    disabled={isReportingLineup || lineupCount >= lineupSlots}
                                    className={`w-9 h-9 rounded-full items-center justify-center bg-brand ${lineupCount >= lineupSlots ? "opacity-40" : ""}`}
                                >
                                    <Ionicons name="add" size={20} color="#f7fbf0" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {isCourtDry && conditionReporter && court?.courtReportedDryAt && (
                        <View className="flex-row items-center mt-4 px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
                            <Ionicons name="water-outline" size={16} color="#B45309" />
                            <Text className="text-base ml-2" style={{ color: "#8C3D08" }}>
                                Reported dry — {conditionReporter.name} {formatReportTime(court.courtReportedDryAt)}
                            </Text>
                        </View>
                    )}
                    {isCheckedIn && !isCourtDry && (
                        <TouchableOpacity onPress={handleReportCourtDry} disabled={isReportingCondition} className="mt-4 flex-row items-center">
                            <Ionicons name="water-outline" size={16} color="#5b6650" />
                            <Text className="text-muted-foreground text-base ml-1.5">Report court dry</Text>
                        </TouchableOpacity>
                    )}
                </GlassContainer>
                </Animated.View>

                {/* Who's coming */}
                <Animated.View entering={FadeInDown.delay(180).duration(450).springify().damping(18)}>
                <GlassContainer style={{ padding: 20, marginBottom: 14 }}>
                    <SectionHeader
                        label="Who's coming"
                        right={
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-row items-center px-3 py-1.5 rounded-full bg-brand-subtle">
                                <Ionicons name="add" size={16} color="#2E5C16" />
                                <Text className="text-brand-strong text-sm font-bold ml-1">Plan</Text>
                            </TouchableOpacity>
                        }
                    />
                    {sortedTimeSlots.length > 0 ? (
                        sortedTimeSlots.map((timeSlot) => (
                            <View key={timeSlot} className="mb-3">
                                <Text className="text-muted-foreground text-sm font-semibold mb-2">
                                    {formatPlannedTime(timeSlot)}
                                </Text>
                                {groupedVisits[timeSlot].map((visit) => {
                                    const isUserPlan = visit.userId === user?._id;
                                    const visitName = isUserPlan ? "You" : visit.user.name || visit.user.email || "Player";
                                    const initials = visitName.trim().slice(0, 1).toUpperCase();
                                    return (
                                        <View key={visit._id} className="flex-row items-center py-1.5">
                                            <TouchableOpacity
                                                onPress={() => !isUserPlan && router.push(`/profile/${visit.user._id}`)}
                                                disabled={isUserPlan}
                                                className="flex-1 flex-row items-center"
                                            >
                                                <View className="w-8 h-8 rounded-full bg-brand-subtle items-center justify-center mr-3">
                                                    <Text className="text-brand-strong font-display-medium text-xs">{initials}</Text>
                                                </View>
                                                <Text className={`text-foreground text-base ${isUserPlan ? "font-semibold" : ""}`}>
                                                    {visitName}
                                                </Text>
                                            </TouchableOpacity>
                                            {isUserPlan && (
                                                <TouchableOpacity onPress={() => handleDeletePlan(visit._id)} hitSlop={8}>
                                                    <Ionicons name="close-circle" size={20} color="#6f7a62" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))
                    ) : (
                        <Text className="text-muted-foreground text-center py-4">No upcoming plans yet</Text>
                    )}
                </GlassContainer>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(240).duration(450).springify().damping(18)}>
                <TouchableOpacity onPress={() => router.push("/players")} activeOpacity={0.7}>
                    <GlassContainer style={{ padding: 16, marginBottom: 14 }}>
                        <View className="flex-row items-center">
                            <IconTile name="people" tone="brand" />
                            <View className="flex-1 ml-3">
                                <Text className="text-base font-bold text-foreground">Browse players</Text>
                                <Text className="text-muted-foreground text-base mt-0.5">Find regulars and rivals near you</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6f7a62" />
                        </View>
                    </GlassContainer>
                </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <Header
                title={court?.name || ""}
                rightButton="chat"
                onRightPress={() => router.push(`/chats/${court?._id || ""}`)}
                onTitlePress={() => setShowCourtSelector(true)}
            />

            <TimePickerPopup isVisible={showTimePicker} onClose={() => setShowTimePicker(false)} onSelectTime={handleSelectTime} />
            <CourtSelectorPopup isVisible={showCourtSelector} onClose={() => setShowCourtSelector(false)} currentCourtId={court?._id} />

            <Popup
                isVisible={showLineupInfo}
                onClose={() => setShowLineupInfo(false)}
                title="How the wait works"
                message="Public courts run first-come, first-served. When it's busy, groups stack up waiting for the next open court. This shows how many groups are in line right now so you can gauge the wait before heading over. Anyone checked in can keep it current."
            />

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
