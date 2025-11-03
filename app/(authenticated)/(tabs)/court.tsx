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

    // Mutations
    const checkIn = useMutation(api.checkIns.checkIn);
    const checkOut = useMutation(api.checkIns.checkOut);
    const createPlannedVisit = useMutation(api.plannedVisits.create);
    const deletePlannedVisit = useMutation(api.plannedVisits.deleteVisit);

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

    const headerHeight = top + 100;
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
                    contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(bottom, 32) }}
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
                                        <View
                                            key={checkIn._id}
                                            className="py-3 border-b border-slate-700 last:border-b-0"
                                        >
                                            <Text className=" text-slate-200 font-semibold">
                                                {checkIn.user.name || checkIn.user.email}
                                            </Text>
                                        </View>
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
                                                            <Text className={`text-slate-200 ${isUserPlan ? "font-semibold" : ""}`}>
                                                                {isUserPlan ? "You" : visit.user.name || visit.user.email}
                                                            </Text>
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

