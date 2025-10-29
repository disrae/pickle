import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface TimePickerPopupProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectTime: (timestamp: number) => void;
}

export const TimePickerPopup = ({ isVisible, onClose, onSelectTime }: TimePickerPopupProps) => {
    const timeSlots = useMemo(() => {
        const slots: { label: string; timestamp: number; }[] = [];
        const now = Date.now();

        // Round up to next 15-minute interval
        const currentDate = new Date(now);
        const minutes = currentDate.getMinutes();
        const roundedMinutes = Math.ceil(minutes / 15) * 15;
        currentDate.setMinutes(roundedMinutes, 0, 0);

        // Generate slots for next 24 hours
        for (let i = 0; i < 96; i++) { // 96 fifteen-minute slots in 24 hours
            const slotDate = new Date(currentDate.getTime() + i * 15 * 60 * 1000);
            const timestamp = slotDate.getTime();

            // Format time
            const hours = slotDate.getHours();
            const mins = slotDate.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            const displayMins = mins.toString().padStart(2, "0");

            // Check if it's today or tomorrow
            const today = new Date(now);
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let dayLabel = "";
            if (slotDate.toDateString() === today.toDateString()) {
                dayLabel = "Today";
            } else if (slotDate.toDateString() === tomorrow.toDateString()) {
                dayLabel = "Tomorrow";
            } else {
                dayLabel = slotDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            }

            const label = i === 0 ? "Now" : `${dayLabel} at ${displayHours}:${displayMins} ${ampm}`;

            slots.push({ label, timestamp });
        }

        return slots;
    }, []);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View
                    className="bg-white rounded-t-3xl max-h-[70%]"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b border-slate-200">
                        <Text className="text-2xl font-bold text-slate-800">
                            When will you go?
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Time slots */}
                    <ScrollView className="px-4 py-2">
                        {timeSlots.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    onSelectTime(slot.timestamp);
                                    onClose();
                                }}
                                className="py-4 px-4 border-b border-slate-100 active:bg-lime-50"
                            >
                                <Text className="text-lg text-slate-700">
                                    {slot.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <View className="h-4" />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

