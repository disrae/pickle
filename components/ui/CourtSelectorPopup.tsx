import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { leagueName } from "@/lib/league";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CourtSelectorPopupProps {
    isVisible: boolean;
    onClose: () => void;
    currentCourtId?: Id<"courts">;
}

export const CourtSelectorPopup = ({ isVisible, onClose, currentCourtId }: CourtSelectorPopupProps) => {
    const { bottom } = useSafeAreaInsets();
    const courts = useQuery(api.courts.list);
    const memberCounts = useQuery(api.league.memberCounts);
    const updateSelectedCourt = useMutation(api.users.updateSelectedCourt);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const countByCourt = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const row of memberCounts ?? []) {
            map.set(row.courtId, row.memberCount);
        }
        return map;
    }, [memberCounts]);

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
            <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1}>
                <View className="flex-1 justify-end bg-black/50">
                    <View
                        className="bg-white rounded-t-3xl max-h-[70%]"
                        style={{
                            paddingBottom: bottom + 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <View className="flex-row items-center justify-between p-6 border-b border-slate-200">
                            <Text className="text-2xl font-bold text-slate-800">
                                Join a league
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="px-4 py-2">
                            {!courts ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator size="large" color="#3F7D20" />
                                </View>
                            ) : courts.length === 0 ? (
                                <View className="py-8 items-center">
                                    <Text className="text-slate-500 text-center">
                                        No leagues available
                                    </Text>
                                </View>
                            ) : (
                                courts.map((court) => {
                                    const isSelected = court._id === currentCourtId;
                                    const members = countByCourt.get(court._id) ?? 0;
                                    return (
                                        <TouchableOpacity
                                            key={court._id}
                                            onPress={() => handleSelectCourt(court._id)}
                                            disabled={isUpdating}
                                            className={`py-4 px-4 border-b border-slate-100 flex-row items-center justify-between ${isSelected ? "bg-brand/10" : "active:bg-slate-50"
                                                }`}
                                        >
                                            <View className="flex-1 pr-3">
                                                <Text className={`text-lg ${isSelected ? "text-brand-strong font-semibold" : "text-slate-700"}`}>
                                                    {leagueName(court.name)}
                                                </Text>
                                                <Text className="text-slate-500 text-sm mt-0.5">
                                                    {members} {members === 1 ? "player" : "players"} · doubles ladder
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={24} color="#3F7D20" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
