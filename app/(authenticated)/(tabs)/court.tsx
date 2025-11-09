import { PicklePaddle } from "@/assets/icons/picklepaddle";
import { Background } from "@/components/ui/Background";
import { Button } from "@/components/ui/button";
import { CourtSelectorPopup } from "@/components/ui/CourtSelectorPopup";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { TimePickerPopup } from "@/components/ui/TimePickerPopup";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourtsScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCourtSelector, setShowCourtSelector] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isReportingLineup, setIsReportingLineup] = useState(false);
    const [isReportingCondition, setIsReportingCondition] = useState(false);

    // Get default court
    const court = useQuery(api.courts.getDefault);

    // Get check-in status
    const currentCheckIn = useQuery(api.checkIns.getCurrentUserCheckIn);
    const checkIns = useQuery(
        api.checkIns.getCurrentCheckIns,
        court ? { courtId: court._id } : "skip"
    );

    // Get planned visits
    const plannedVisits = useQuery(
        api.plannedVisits.getForCourt,
        court ? { courtId: court._id } : "skip"
    );

    // Get court condition and reporter info
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

    // Mutations
    const checkIn = useMutation(api.checkIns.checkIn);
    const checkOut = useMutation(api.checkIns.checkOut);
    const createPlannedVisit = useMutation(api.plannedVisits.create);
    const deletePlannedVisit = useMutation(api.plannedVisits.deleteVisit);
    const reportLineup = useMutation(api.courts.reportLineup);
    const reportCourtDry = useMutation(api.courts.reportCourtDry);

    const handleCheckIn = async () => {
        if (!court) return;
        setIsCheckingIn(true);
        try {
            await checkIn({ courtId: court._id });
        } catch (error) {
            console.error("Check-in error:", error);
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setIsCheckingOut(true);
        try {
            await checkOut();
        } catch (error) {
            console.error("Check-out error:", error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handleSelectTime = async (timestamp: number) => {
        if (!court) return;
        try {
            await createPlannedVisit({ courtId: court._id, plannedTime: timestamp });
        } catch (error) {
            console.error("Plan visit error:", error);
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
        if (slotDate.getTime() === today.getTime()) {
            dayLabel = "Today";
        } else if (slotDate.getTime() === tomorrow.getTime()) {
            dayLabel = "Tomorrow";
        } else {
            dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        }

        const hours = date.getHours();
        const mins = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMins = mins.toString().padStart(2, "0");

        return `${dayLabel} at ${displayHours}:${displayMins} ${ampm}`;
    };

    const formatReportTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 1) {
            return "just now";
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            const hours = date.getHours();
            const mins = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            const displayMins = mins.toString().padStart(2, "0");
            return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${displayHours}:${displayMins} ${ampm}`;
        }
    };

    // Group planned visits by time slot
    const groupedVisits = plannedVisits?.reduce((acc, visit) => {
        const timeKey = visit.plannedTime;
        if (!acc[timeKey]) {
            acc[timeKey] = [];
        }
        acc[timeKey].push(visit);
        return acc;
    }, {} as Record<number, typeof plannedVisits>) || {};

    const sortedTimeSlots = Object.keys(groupedVisits)
        .map(Number)
        .sort((a, b) => a - b);

    const headerHeight = 100;
    const isCheckedIn = !!currentCheckIn;

    if (court === undefined) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center px-8">
                    <ActivityIndicator size="large" color="#65a30d" />
                </View>
            </Background>
        );
    }

    if (!court && Boolean(user)) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center px-8">

                    <Ionicons name="location-outline" size={92} color="#000000B3" />
                    <Text className="text-black/80 text-2xl tracking-wide font-bold mt-6 text-center">
                        No Court Selected
                    </Text>

                    <View className="h-10" />

                    <Button
                        onPress={() => setShowCourtSelector(true)}
                        size="lg"
                        className="bg-secondary"
                    >
                        <Ionicons name="add-circle-outline" size={24} color="white" />
                        <Text className="text-white text-lg font-semibold ml-2">
                            Select Court
                        </Text>
                    </Button>
                </View>

                <CourtSelectorPopup
                    isVisible={showCourtSelector}
                    onClose={() => setShowCourtSelector(false)}
                    currentCourtId={undefined}
                />
            </Background>
        );
    }

    return (
        <Background>
            <View className="flex-1">
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(bottom, (isLiquidGlassAvailable() ? 80 : 32)) }}
                >
                    {/* Content wrapper to keep cards at the start */}
                    <View className="flex-1 justify-start">
                        {/* Court Notes */}
                        {court?.notes && (
                            <View className="bg-amber-50 rounded-2xl p-4 mb-4 border-2 border-amber-200">
                                <View className="flex-row items-start">
                                    <Ionicons name="information-circle" size={24} color="#f59e0b" />
                                    <Text className="text-amber-800 ml-2 flex-1">{court.notes}</Text>
                                </View>
                            </View>
                        )}

                        {isLiquidGlassAvailable() && <View className='h-6' />}
                        {Platform.OS === 'web' && <View className='h-6' />}

                        {/* Lineup and Condition Section */}
                        <GlassContainer
                            style={{
                                borderRadius: 24,
                                padding: 24,
                                marginBottom: 16,
                            }}
                        >
                            {/* Lineup Section */}
                            <View className="mb-6">
                                {isCheckedIn ? (
                                    <View>
                                        <View className="flex-row flex-wrap items-center gap-3 mb-3">
                                            {Array.from({ length: 8 }, (_, i) => {
                                                const paddleNumber = i + 1;
                                                const isFilled = isLineupValid && court?.currentLineupCount !== undefined && paddleNumber <= court.currentLineupCount;
                                                const isSelected = isLineupValid && court?.currentLineupCount === paddleNumber;
                                                return (
                                                    <TouchableOpacity
                                                        key={i}
                                                        onPress={() => handleReportLineup(isSelected ? 0 : paddleNumber)}
                                                        disabled={isReportingLineup}
                                                        className="opacity-90"
                                                    >
                                                        <PicklePaddle
                                                            width={30}
                                                            height={30}
                                                            tintColor={isFilled ? "#b8ff48" : "#aaa"}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        {isLineupValid && court?.currentLineupCount !== undefined && court.currentLineupCount > 0 && lineupReporter && (
                                            <Text className="text-slate-200 text-sm">
                                                Lineup for {court.currentLineupCount} {court.currentLineupCount === 1 ? "court" : "courts"}, reported by {lineupReporter.name || lineupReporter.email}
                                                {court.lineupReportedAt && ` ${formatReportTime(court.lineupReportedAt)}`}
                                            </Text>
                                        )}
                                        {(!isLineupValid || !court?.currentLineupCount || court.currentLineupCount === 0) && (
                                            <Text className="text-slate-300 tracking-wide text-sm">
                                                Tap a paddle to report lineup
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <View>
                                        <View className="flex-row flex-wrap gap-3 mb-3 opacity-65">
                                            {Array.from({ length: 8 }, (_, i) => {
                                                const paddleNumber = i + 1;
                                                const isFilled = isLineupValid && court?.currentLineupCount !== undefined && paddleNumber <= court.currentLineupCount;
                                                return (
                                                    <View key={i}>
                                                        <PicklePaddle
                                                            width={30}
                                                            height={30}
                                                            tintColor={isFilled ? "#b8ff48" : "#aaa"}
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        {isLineupValid && court?.currentLineupCount !== undefined && court.currentLineupCount > 0 && lineupReporter && (
                                            <Text className="text-slate-300 text-sm">
                                                Lineup for {court.currentLineupCount} {court.currentLineupCount === 1 ? "court" : "courts"}, reported by {lineupReporter.name || lineupReporter.email}
                                                {court.lineupReportedAt && ` ${formatReportTime(court.lineupReportedAt)}`}
                                            </Text>
                                        )}
                                        {(!isLineupValid || !court?.currentLineupCount || court.currentLineupCount === 0) && (
                                            <Text className="text-slate-200 text-sm">
                                                Check in to report lineup
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Court Condition Section */}
                            {((isCourtDry || (user && isCheckedIn))) && (
                                <View className="mt-">
                                    {isCourtDry && conditionReporter && court?.courtReportedDryAt ? (
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="flame"
                                                size={24}
                                                color="#ef4444"
                                            />
                                            <Text className="text-slate-200 text-sm tracking-wide ml-2">
                                                Court reported dry by {conditionReporter.name || conditionReporter.email} {formatReportTime(court.courtReportedDryAt)}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Ionicons
                                                    name="flame"
                                                    size={24}
                                                    color="#64748b"
                                                />
                                            </View>
                                            {user && isCheckedIn && !isCourtDry && (
                                                <TouchableOpacity
                                                    onPress={handleReportCourtDry}
                                                    disabled={isReportingCondition}
                                                    className="flex-row items-center px-3 py-1.5 rounded-lg bg-slate-700/80 border border-red-400"
                                                >
                                                    {isReportingCondition ? (
                                                        <ActivityIndicator size="small" color="#ef4444" />
                                                    ) : (
                                                        <>
                                                            <Ionicons name="flame" size={18} color="#ef4444" />
                                                            <Text className="text-sm font-semibold ml-1.5 text-red-400">
                                                                Report Dry
                                                            </Text>
                                                        </>
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        </GlassContainer>
                        
                        {/* Currently Checked In Section */}
                        <GlassContainer
                            style={{
                                borderRadius: 24,
                                padding: 24,
                                marginBottom: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-2xl font-bold text-slate-200">
                                    Who&apos;s Here
                                </Text>
                                <TouchableOpacity
                                    onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
                                    disabled={isCheckingIn || isCheckingOut}
                                    className={`flex-row items-center px-3 py-1.5 rounded-lg ${isCheckedIn ? "bg-slate-700/80 border border-red-400" : "bg-slate-700/80 border border-lime-400"
                                        }`}
                                >
                                    {isCheckingIn || isCheckingOut ? (
                                        <ActivityIndicator size="small" color={isCheckedIn ? "#ef4444" : "#84cc16"} />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name={isCheckedIn ? "exit-outline" : "checkmark-circle"}
                                                size={18}
                                                color={isCheckedIn ? "#ef4444" : "#84cc16"}
                                            />
                                            <Text className={`text-sm font-semibold ml-1.5 ${isCheckedIn ? "text-red-400" : "text-lime-400"
                                                }`}>
                                                {isCheckedIn ? "Check Out" : "Check In"}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {checkIns && checkIns.length > 0 ? (
                                <View>
                                    {checkIns.map((checkIn) => (
                                        <TouchableOpacity
                                            key={checkIn._id}
                                            onPress={() => router.push(`/profile/${checkIn.user._id}`)}
                                            className="py-3 border-b border-slate-700 last:border-b-0"
                                            activeOpacity={0.7}
                                        >
                                            <Text className=" text-slate-200 font-semibold">
                                                {checkIn.user.name || checkIn.user.email}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <View className="items-center py-4">
                                    <Text className="text-slate-200 text-center">
                                        No one is currently checked in
                                    </Text>
                                </View>
                            )}
                        </GlassContainer>

                        {/* Planned Visits Section */}
                        <GlassContainer
                            style={{
                                borderRadius: 24,
                                padding: 24,
                                marginBottom: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-2xl font-bold text-slate-200">
                                    Who&apos;s Coming
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowTimePicker(true)}
                                    className="flex-row items-center px-3 py-1.5 rounded-lg bg-slate-700/80 border border-lime-400"
                                >
                                    <Ionicons name="add-circle-outline" size={18} color="#84cc16" />
                                    <Text className="text-sm font-semibold ml-1.5 text-lime-400">
                                        Plan
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {sortedTimeSlots.length > 0 ? (
                                <View>
                                    {sortedTimeSlots.map((timeSlot) => {
                                        const visits = groupedVisits[timeSlot];
                                        return (
                                            <View key={timeSlot} className="mb-4 last:mb-0">
                                                <Text className="text-sm font-semibold text-lime-400 mb-2">
                                                    {formatPlannedTime(timeSlot)}
                                                </Text>
                                                {visits.map((visit) => {
                                                    const isUserPlan = visit.userId === user?._id;
                                                    return (
                                                        <View
                                                            key={visit._id}
                                                            className="flex-row items-center justify-between py-2 pl-4"
                                                        >
                                                            <TouchableOpacity
                                                                onPress={() => !isUserPlan && router.push(`/profile/${visit.user._id}`)}
                                                                disabled={isUserPlan}
                                                                activeOpacity={0.7}
                                                                className="flex-1"
                                                            >
                                                                <Text className={`text-slate-200 ${isUserPlan ? "font-semibold" : ""}`}>
                                                                    {isUserPlan ? "You" : visit.user.name || visit.user.email}
                                                                </Text>
                                                            </TouchableOpacity>
                                                            {isUserPlan && (
                                                                <TouchableOpacity
                                                                    onPress={() => handleDeletePlan(visit._id)}
                                                                    className="ml-2"
                                                                >
                                                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className="items-center py-8">
                                    <Ionicons name="time-outline" size={48} color="#64748b" />
                                    <Text className="text-slate-200 text-center mt-4">
                                        No upcoming plans yet
                                    </Text>
                                    <Text className="text-slate-400 text-center text-sm mt-2">
                                        Be the first to schedule!
                                    </Text>
                                </View>
                            )}
                        </GlassContainer>

                        {/* Browse Players Button */}
                        <TouchableOpacity
                            onPress={() => router.push("/players")}
                            className="mb-4"
                            activeOpacity={0.7}
                        >
                            <GlassContainer
                                style={{
                                    borderRadius: 24,
                                    padding: 20,
                                }}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="people" size={24} color="#a3e635" />
                                    <Text className="text-xl font-bold text-slate-200 ml-3">
                                        Browse All Players
                                    </Text>
                                    <Ionicons name="chevron-forward" size={24} color="#cbd5e1" className="ml-2" />
                                </View>
                            </GlassContainer>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <Header
                title={court?.name || ""}
                rightButton="chat"
                onRightPress={() => router.push(`/chats/${court?._id || ""}`)}
                onTitlePress={() => setShowCourtSelector(true)}
                user={user}
            />

            <TimePickerPopup
                isVisible={showTimePicker}
                onClose={() => setShowTimePicker(false)}
                onSelectTime={handleSelectTime}
            />

            <CourtSelectorPopup
                isVisible={showCourtSelector}
                onClose={() => setShowCourtSelector(false)}
                currentCourtId={court?._id}
            />
        </Background>
    );
}

