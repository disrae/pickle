import { GlassContainer } from "@/components/ui/GlassContainer";
import { StyledButton } from "@/components/ui/StyledButton";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";

const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

type CheckInRow = {
    _id: string;
    user: { _id: string; name?: string; email?: string };
};

interface CourtHeroProps {
    hereCount: number;
    comingCount: number;
    checkIns: CheckInRow[];
    currentUserId?: Id<"users">;
    isCheckedIn: boolean;
    isCheckingIn: boolean;
    isCheckingOut: boolean;
    onCheckIn: (isPrivate?: boolean) => void;
    onCheckOut: () => void;
    onPlayerPress: (userId: string) => void;
    onChallenge: (userId: Id<"users">) => void;
}

export function CourtHero({
    hereCount,
    comingCount,
    checkIns,
    currentUserId,
    isCheckedIn,
    isCheckingIn,
    isCheckingOut,
    onCheckIn,
    onCheckOut,
    onPlayerPress,
    onChallenge,
}: CourtHeroProps) {
    return (
        <GlassContainer
            style={{
                backgroundColor: "#EAF4DE",
                borderColor: "rgba(46,92,22,0.16)",
                padding: 22,
                marginBottom: 14,
            }}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-1.5">
                    <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: hereCount > 0 ? "#3F7D20" : "#a8b199" }}
                    />
                    <Text className="text-sm font-semibold" style={{ color: "#2E5C16" }}>
                        Right now at court
                    </Text>
                </View>
                {comingCount > 0 && (
                    <View className="flex-row items-center px-3 py-1 rounded-full bg-brand">
                        <Text className="text-brand-foreground font-display-bold text-sm">{comingCount}</Text>
                        <Text className="text-brand-foreground text-sm font-semibold ml-1">coming</Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-baseline gap-2 mb-5">
                <Text className="text-foreground font-display-bold" style={{ fontSize: 60, lineHeight: 62 }}>
                    {hereCount}
                </Text>
                <Text className="text-muted-foreground text-lg mb-2">
                    {hereCount === 1 ? "player here" : "players here"}
                </Text>
            </View>

            {checkIns.length > 0 ? (
                <View className="gap-2 mb-5">
                    {checkIns.slice(0, 8).map((checkIn) => {
                        const isSelf = checkIn.user._id === currentUserId;
                        const displayName =
                            checkIn.user.name || checkIn.user.email?.split("@")[0] || "Player";
                        const initials = displayName.trim().slice(0, 1).toUpperCase();
                        return (
                            <View
                                key={checkIn._id}
                                className="flex-row items-center rounded-2xl px-2.5 py-2 bg-surface"
                                style={{ borderWidth: 1, borderColor: "rgba(46,92,22,0.10)" }}
                            >
                                <TouchableOpacity
                                    onPress={() => onPlayerPress(checkIn.user._id)}
                                    className="flex-1 flex-row items-center"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-9 h-9 rounded-full bg-brand items-center justify-center mr-3">
                                        <Text className="text-brand-foreground font-display-medium text-sm">{initials}</Text>
                                    </View>
                                    <Text className="text-foreground text-base font-semibold">
                                        {displayName}
                                        {isSelf ? " (you)" : ""}
                                    </Text>
                                </TouchableOpacity>
                                {!isSelf && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            tap();
                                            onChallenge(checkIn.user._id as Id<"users">);
                                        }}
                                        activeOpacity={0.85}
                                        className="flex-row items-center px-3 py-1.5 rounded-full"
                                        style={{ backgroundColor: "rgba(245,158,11,0.16)" }}
                                    >
                                        <Ionicons name="flash" size={13} color="#B45309" />
                                        <Text style={{ color: "#B45309", fontWeight: "800", fontSize: 12, marginLeft: 4 }}>
                                            Challenge
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Text className="text-muted-foreground text-base mb-5">
                    Nobody checked in yet — be the first or see who&apos;s coming below.
                </Text>
            )}

            <View className="flex-row gap-3">
                {isCheckedIn ? (
                    <TouchableOpacity
                        onPress={() => {
                            tap();
                            onCheckOut();
                        }}
                        disabled={isCheckingOut}
                        activeOpacity={0.85}
                        className="flex-1 h-14 rounded-2xl items-center justify-center bg-surface"
                        style={{ borderWidth: 1, borderColor: "rgba(18,23,15,0.14)" }}
                    >
                        {isCheckingOut ? (
                            <ActivityIndicator size="small" color="#2E5C16" />
                        ) : (
                            <Text className="text-foreground text-base font-bold">Check out</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => {
                                tap();
                                onCheckIn(false);
                            }}
                            disabled={isCheckingIn}
                            activeOpacity={0.9}
                            className="flex-1 h-14 rounded-2xl items-center justify-center bg-brand active:bg-brand-strong"
                        >
                            {isCheckingIn ? (
                                <ActivityIndicator size="small" color="#f7fbf0" />
                            ) : (
                                <Text className="text-brand-foreground text-base font-display">I&apos;m here</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                tap();
                                onCheckIn(true);
                            }}
                            disabled={isCheckingIn}
                            className="w-14 h-14 rounded-2xl items-center justify-center bg-surface"
                            style={{ borderWidth: 1, borderColor: "rgba(18,23,15,0.14)" }}
                        >
                            <Ionicons name="eye-off-outline" size={22} color="#474F3E" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {!isCheckedIn && (
                <Text className="text-muted-foreground text-sm mt-2.5 text-center">
                    Eye icon = arrive privately (hidden from roster)
                </Text>
            )}
        </GlassContainer>
    );
}

interface CourtEmptyActionsProps {
    onHeadedThere: () => void;
    onPlanVisit: () => void;
    isLoading: boolean;
}

export function CourtEmptyActions({
    onHeadedThere,
    onPlanVisit,
    isLoading,
}: CourtEmptyActionsProps) {
    return (
        <GlassContainer style={{ padding: 20, marginBottom: 14 }}>
            <Text className="text-foreground text-lg font-bold mb-1">Court&apos;s quiet</Text>
            <Text className="text-muted-foreground mb-5">
                Start the loop — let regulars know you&apos;re headed there.
            </Text>
            <StyledButton
                variant="brand"
                title="I'm headed there — notify regulars"
                onPress={onHeadedThere}
                loading={isLoading}
                className="mb-3"
            />
            <StyledButton variant="outline" title="Plan a specific time" onPress={onPlanVisit} />
        </GlassContainer>
    );
}
