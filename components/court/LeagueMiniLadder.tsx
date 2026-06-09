import { GlassContainer } from "@/components/ui/GlassContainer";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type TopPlayer = {
    rank: number;
    userId: Id<"users">;
    rating: number;
    matchesPlayed: number;
    isMe: boolean;
    user: { _id: Id<"users">; name?: string; email?: string } | null;
};

interface LeagueMiniLadderProps {
    topPlayers: TopPlayer[];
    onViewStandings: () => void;
}

export function LeagueMiniLadder({ topPlayers, onViewStandings }: LeagueMiniLadderProps) {
    if (topPlayers.length === 0) {
        return (
            <TouchableOpacity onPress={onViewStandings} activeOpacity={0.85}>
                <View
                    className="rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between"
                    style={{ backgroundColor: "rgba(245,158,11,0.10)", borderWidth: 1, borderColor: "rgba(245,158,11,0.22)" }}
                >
                    <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 14 }}>
                        Be the first on the ladder
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#B45309" />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={onViewStandings}
                activeOpacity={0.85}
                className="flex-row items-center justify-between mb-2"
            >
                <Text style={{ color: "#B45309", fontWeight: "800", fontSize: 13, letterSpacing: 0.3 }}>
                    TOP OF THE LADDER
                </Text>
                <View className="flex-row items-center">
                    <Text style={{ color: "#B45309", fontWeight: "600", fontSize: 13 }}>Full standings</Text>
                    <Ionicons name="chevron-forward" size={14} color="#B45309" style={{ marginLeft: 2 }} />
                </View>
            </TouchableOpacity>
            <GlassContainer
                style={{
                    padding: 0,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(245,158,11,0.18)",
                }}
            >
                {topPlayers.map((entry, i) => {
                    const displayName =
                        entry.user?.name || entry.user?.email?.split("@")[0] || "Player";
                    const isLast = i === topPlayers.length - 1;
                    return (
                        <View
                            key={entry.userId}
                            className="flex-row items-center px-3 py-2.5"
                            style={{
                                borderBottomWidth: isLast ? 0 : 1,
                                borderBottomColor: "rgba(245,158,11,0.12)",
                                backgroundColor: entry.isMe ? "rgba(245,158,11,0.06)" : undefined,
                            }}
                        >
                            <Text
                                style={{
                                    color: entry.isMe ? "#3F7D20" : "#B45309",
                                    fontWeight: "800",
                                    fontSize: 14,
                                    width: 28,
                                }}
                            >
                                #{entry.rank}
                            </Text>
                            <Text
                                className="flex-1 text-base font-semibold text-foreground"
                                numberOfLines={1}
                            >
                                {displayName}
                                {entry.isMe ? " (you)" : ""}
                            </Text>
                            <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 14 }}>
                                {entry.rating}
                            </Text>
                        </View>
                    );
                })}
            </GlassContainer>
        </View>
    );
}
