import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface CourtSelectorPopupProps {
    isVisible: boolean;
    onClose: () => void;
    currentCourtId?: Id<"courts">;
}

export const CourtSelectorPopup = ({ isVisible, onClose, currentCourtId }: CourtSelectorPopupProps) => {
    const courts = useQuery(api.courts.list);
    const updateSelectedCourt = useMutation(api.users.updateSelectedCourt);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const handleSelectCourt = async (courtId: Id<"courts">) => {
        setIsUpdating(true);
        try {
            await updateSelectedCourt({ courtId });
            onClose();
        } catch (error) {
            console.error("Error updating selected court:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity className="flex-1" onPress={onClose}>
                <View className="flex-1 justify-end">
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
                                Select a Court
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Courts list */}
                        <ScrollView className="px-4 py-2">
                            {!courts ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator size="large" color="#84cc16" />
                                </View>
                            ) : courts.length === 0 ? (
                                <View className="py-8 items-center">
                                    <Text className="text-slate-500 text-center">
                                        No courts available
                                    </Text>
                                </View>
                            ) : (
                                courts.map((court) => {
                                    const isSelected = court._id === currentCourtId;
                                    return (
                                        <TouchableOpacity
                                            key={court._id}
                                            onPress={() => handleSelectCourt(court._id)}
                                            disabled={isUpdating}
                                            className={`py-4 px-4 border-b border-slate-100 flex-row items-center justify-between ${isSelected ? "bg-lime-50" : "active:bg-slate-50"
                                                }`}
                                        >
                                            <Text className={`text-lg ${isSelected ? "text-lime-700 font-semibold" : "text-slate-700"}`}>
                                                {court.name}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={24} color="#84cc16" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                            <View className="h-4" />
                        </ScrollView>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

