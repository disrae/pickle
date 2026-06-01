import { GlassContainer } from "@/components/ui/GlassContainer";
import { StyledButton } from "@/components/ui/StyledButton";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

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
        <GlassContainer style={{ borderRadius: 28, padding: 24, marginBottom: 16 }}>
            <View className="flex-row items-end justify-between mb-6">
                <View>
                    <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                        Right now
                    </Text>
                    <View className="flex-row items-baseline gap-2 mt-1">
                        <Text className="text-foreground text-5xl font-bold">{hereCount}</Text>
                        <Text className="text-muted-foreground text-lg">here</Text>
                        {comingCount > 0 && (
                            <>
                                <Text className="text-muted-foreground text-lg mx-1">·</Text>
                                <Text className="text-brand text-2xl font-bold">{comingCount}</Text>
                                <Text className="text-muted-foreground text-lg">coming</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {checkIns.length > 0 ? (
                <View className="gap-2 mb-6">
                    {checkIns.slice(0, 8).map((checkIn) => {
                        const isSelf = checkIn.user._id === currentUserId;
                        const displayName =
                            checkIn.user.name || checkIn.user.email?.split("@")[0] || "Player";
                        return (
                            <View
                                key={checkIn._id}
                                className="flex-row items-center bg-surface-2 rounded-2xl px-3 py-2"
                            >
                                <TouchableOpacity
                                    onPress={() => onPlayerPress(checkIn.user._id)}
                                    className="flex-1"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-foreground text-sm font-medium">
                                        {displayName}
                                        {isSelf ? " (you)" : ""}
                                    </Text>
                                </TouchableOpacity>
                                {!isSelf && (
                                    <TouchableOpacity
                                        onPress={() => onChallenge(checkIn.user._id as Id<"users">)}
                                        activeOpacity={0.7}
                                        style={{
                                            marginLeft: 8,
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderRadius: 10,
                                            backgroundColor: "rgba(245, 158, 11, 0.15)",
                                            borderWidth: 1,
                                            borderColor: "rgba(245, 158, 11, 0.3)",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#f59e0b",
                                                fontWeight: "700",
                                                fontSize: 12,
                                            }}
                                        >
                                            Challenge
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Text className="text-muted-foreground mb-6">
                    Nobody checked in yet — be the first or see who&apos;s coming below.
                </Text>
            )}

            <View className="flex-row gap-3">
                {isCheckedIn ? (
                    <StyledButton
                        variant="outline"
                        title="Check out"
                        fullWidth={false}
                        className="flex-1"
                        onPress={onCheckOut}
                        loading={isCheckingOut}
                    />
                ) : (
                    <>
                        <StyledButton
                            variant="brand"
                            title="I'm here"
                            fullWidth={false}
                            className="flex-1"
                            onPress={() => onCheckIn(false)}
                            loading={isCheckingIn}
                        />
                        <TouchableOpacity
                            onPress={() => onCheckIn(true)}
                            disabled={isCheckingIn}
                            className="px-4 py-3 rounded-2xl border border-border items-center justify-center"
                        >
                            {isCheckingIn ? (
                                <ActivityIndicator size="small" color="#a3e635" />
                            ) : (
                                <Ionicons name="eye-off-outline" size={22} color="#6b7563" />
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {!isCheckedIn && (
                <Text className="text-muted-foreground text-xs mt-2 text-center">
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
        <GlassContainer style={{ borderRadius: 28, padding: 24, marginBottom: 16 }}>
            <Text className="text-foreground text-xl font-bold mb-2">Court&apos;s quiet</Text>
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
