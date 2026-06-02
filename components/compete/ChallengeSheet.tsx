import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Format = "doubles" | "singles";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    /** Pre-selected opponent (from roster or ladder tap) */
    preselectedOpponentId?: Id<"users">;
    preselectedOpponentTeamId?: Id<"teams">;
    courtId: Id<"courts">;
}

export function ChallengeSheet({
    isVisible,
    onClose,
    preselectedOpponentId,
    preselectedOpponentTeamId,
    courtId,
}: Props) {
    const [format, setFormat] = useState<Format>("doubles");
    const [partnerId, setPartnerId] = useState<Id<"users"> | null>(null);
    const [opponentId, setOpponentId] = useState<Id<"users"> | null>(
        preselectedOpponentId ?? null
    );
    const [opponentPartnerId, setOpponentPartnerId] = useState<Id<"users"> | null>(null);
    const [sending, setSending] = useState(false);

    const currentUser = useQuery(api.users.currentUser);
    const checkIns = useQuery(api.checkIns.getCurrentCheckIns, { courtId });
    const issueChallenge = useMutation(api.challenges.issueChallenge);

    const checkedInPlayers =
        checkIns?.filter((c) => c.user?._id !== currentUser?._id) ?? [];

    const canSubmit =
        format === "singles"
            ? !!opponentId
            : !!partnerId && !!opponentId && !!opponentPartnerId;

    const handleSend = async () => {
        if (!opponentId || sending) return;
        setSending(true);
        try {
            await issueChallenge({
                challengedId: opponentId,
                challengedPartnerId: opponentPartnerId ?? undefined,
                challengedTeamId: preselectedOpponentTeamId,
                challengerPartnerId: partnerId ?? undefined,
                format,
                courtId,
            });
            onClose();
            // Reset
            setPartnerId(null);
            setOpponentId(preselectedOpponentId ?? null);
            setOpponentPartnerId(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={onClose} maxHeight="80%" tone="dark">
            <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                {/* Title */}
                <Text
                    style={{
                        color: "#f1f5f9",
                        fontWeight: "700",
                        fontSize: 20,
                        marginBottom: 20,
                    }}
                >
                    Send Challenge
                </Text>

                {/* Format picker */}
                <Text style={labelStyle}>Format</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                    {(["doubles", "singles"] as Format[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            activeOpacity={0.7}
                            onPress={() => {
                                setFormat(f);
                                setPartnerId(null);
                                setOpponentPartnerId(null);
                            }}
                        >
                            <View
                                style={{
                                    paddingHorizontal: 18,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor:
                                        format === f
                                            ? "rgba(245,158,11,0.15)"
                                            : "rgba(255,255,255,0.05)",
                                    borderWidth: 1,
                                    borderColor:
                                        format === f
                                            ? "rgba(245,158,11,0.4)"
                                            : "rgba(255,255,255,0.1)",
                                }}
                            >
                                <Text
                                    style={{
                                        color: format === f ? "#f59e0b" : "#6b7280",
                                        fontWeight: "600",
                                        fontSize: 14,
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {f}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {checkIns === undefined ? (
                    <ActivityIndicator color="#f59e0b" />
                ) : checkedInPlayers.length === 0 ? (
                    <Text style={{ color: "#6b7280", textAlign: "center", marginVertical: 16 }}>
                        Nobody else checked in right now
                    </Text>
                ) : (
                    <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                        {/* Your partner (doubles only) */}
                        {format === "doubles" && (
                            <>
                                <Text style={labelStyle}>Your Partner</Text>
                                {checkedInPlayers
                                    .filter((c) => c.user?._id !== opponentId && c.user?._id !== opponentPartnerId)
                                    .map((c) => (
                                        <PlayerPill
                                            key={c._id}
                                            name={c.user?.name ?? "Unknown"}
                                            selected={partnerId === c.user?._id}
                                            onPress={() =>
                                                setPartnerId(
                                                    partnerId === c.user?._id ? null : c.user!._id
                                                )
                                            }
                                        />
                                    ))}
                                <View style={{ height: 12 }} />
                            </>
                        )}

                        {/* Opponent */}
                        <Text style={labelStyle}>
                            {format === "doubles" ? "Opponent 1" : "Opponent"}
                        </Text>
                        {checkedInPlayers
                            .filter(
                                (c) =>
                                    c.user?._id !== partnerId &&
                                    c.user?._id !== opponentPartnerId
                            )
                            .map((c) => (
                                <PlayerPill
                                    key={c._id}
                                    name={c.user?.name ?? "Unknown"}
                                    selected={opponentId === c.user?._id}
                                    onPress={() =>
                                        setOpponentId(
                                            opponentId === c.user?._id ? null : c.user!._id
                                        )
                                    }
                                />
                            ))}

                        {/* Opponent partner (doubles only) */}
                        {format === "doubles" && (
                            <>
                                <View style={{ height: 12 }} />
                                <Text style={labelStyle}>Opponent 2</Text>
                                {checkedInPlayers
                                    .filter(
                                        (c) =>
                                            c.user?._id !== partnerId &&
                                            c.user?._id !== opponentId
                                    )
                                    .map((c) => (
                                        <PlayerPill
                                            key={c._id}
                                            name={c.user?.name ?? "Unknown"}
                                            selected={opponentPartnerId === c.user?._id}
                                            onPress={() =>
                                                setOpponentPartnerId(
                                                    opponentPartnerId === c.user?._id
                                                        ? null
                                                        : c.user!._id
                                                )
                                            }
                                        />
                                    ))}
                            </>
                        )}

                        <View style={{ height: 20 }} />
                    </ScrollView>
                )}

                {/* Send button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSend}
                    disabled={!canSubmit || sending}
                    style={{
                        paddingVertical: 14,
                        borderRadius: 16,
                        backgroundColor: canSubmit
                            ? "rgba(245,158,11,0.9)"
                            : "rgba(245,158,11,0.2)",
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    {sending ? (
                        <ActivityIndicator color="#151c0c" />
                    ) : (
                        <>
                            <Ionicons
                                name="trophy"
                                size={18}
                                color={canSubmit ? "#151c0c" : "#f59e0b"}
                            />
                            <Text
                                style={{
                                    color: canSubmit ? "#151c0c" : "#f59e0b",
                                    fontWeight: "700",
                                    fontSize: 15,
                                }}
                            >
                                Send Challenge
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </BottomSheetCard>
    );
}

function PlayerPill({
    name,
    selected,
    onPress,
}: {
    name: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    marginBottom: 6,
                    borderRadius: 14,
                    backgroundColor: selected
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(255,255,255,0.04)",
                    borderWidth: 1,
                    borderColor: selected
                        ? "rgba(245,158,11,0.4)"
                        : "rgba(255,255,255,0.07)",
                }}
            >
                <View
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? "#f59e0b" : "#4b5563",
                        backgroundColor: selected ? "#f59e0b" : "transparent",
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {selected && <Ionicons name="checkmark" size={12} color="#151c0c" />}
                </View>
                <Text
                    style={{
                        color: selected ? "#f1f5f9" : "#9ca3af",
                        fontWeight: selected ? "600" : "400",
                        fontSize: 14,
                    }}
                >
                    {name}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const labelStyle = {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
};
