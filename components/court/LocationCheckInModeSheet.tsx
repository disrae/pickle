import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { api } from "@/convex/_generated/api";
import {
    requestLocationPermissionForMode,
    type LocationCheckInMode,
} from "@/lib/location-permissions";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface Props {
    isVisible: boolean;
    onDismiss: () => void;
    onPermissionDenied?: () => void;
    onUnavailable?: () => void;
}

const OPTIONS: {
    mode: LocationCheckInMode;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}[] = [
    {
        mode: "foreground",
        label: "Only when the app is open",
        description: "Auto check-in while you're using WePickle",
        icon: "phone-portrait-outline",
    },
    {
        mode: "background",
        label: "Even when it's in my pocket",
        description: "Check in automatically when you arrive at court",
        icon: "locate-outline",
    },
    {
        mode: "off",
        label: "Manual only",
        description: "I'll tap check-in myself",
        icon: "hand-left-outline",
    },
];

export function LocationCheckInModeSheet({
    isVisible,
    onDismiss,
    onPermissionDenied,
    onUnavailable,
}: Props) {
    const updateLocationCheckInMode = useMutation(api.users.updateLocationCheckInMode);
    const [saving, setSaving] = useState<LocationCheckInMode | null>(null);

    const handleSelect = async (mode: LocationCheckInMode) => {
        if (saving) return;
        setSaving(mode);
        try {
            const { granted, unavailable } = await requestLocationPermissionForMode(mode);
            if (unavailable) {
                onUnavailable?.();
                return;
            }
            if (!granted) {
                onPermissionDenied?.();
                return;
            }
            await updateLocationCheckInMode({ mode });
            onDismiss();
        } catch (error) {
            console.error("Location mode error:", error);
        } finally {
            setSaving(null);
        }
    };

    const handleSkip = async () => {
        if (saving) return;
        setSaving("off");
        try {
            await updateLocationCheckInMode({ mode: "off" });
            onDismiss();
        } catch (error) {
            console.error("Location mode skip error:", error);
        } finally {
            setSaving(null);
        }
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={handleSkip} maxHeight="75%">
            <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
                <View className="items-center mb-5">
                    <View className="w-14 h-14 rounded-full bg-brand/15 items-center justify-center mb-3">
                        <Ionicons name="location" size={28} color="#3F7D20" />
                    </View>
                    <Text className="text-foreground text-xl font-bold text-center">
                        How should we check you in?
                    </Text>
                    <Text className="text-foreground-muted text-sm text-center mt-2 leading-5">
                        Auto check-in lets friends see when you&apos;re at the court. You can change
                        this anytime in Profile.
                    </Text>
                </View>

                <View className="gap-2">
                    {OPTIONS.map(({ mode, label, description, icon }) => {
                        const isSaving = saving === mode;
                        return (
                            <TouchableOpacity
                                key={mode}
                                activeOpacity={0.7}
                                disabled={!!saving}
                                onPress={() => handleSelect(mode)}
                                className="flex-row items-center px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50"
                            >
                                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3">
                                    <Ionicons name={icon} size={20} color="#3F7D20" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold">{label}</Text>
                                    <Text className="text-foreground-muted text-xs mt-0.5">{description}</Text>
                                </View>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#3F7D20" />
                                ) : (
                                    <Ionicons name="chevron-forward" size={18} color="#5c6454" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </BottomSheetCard>
    );
}
