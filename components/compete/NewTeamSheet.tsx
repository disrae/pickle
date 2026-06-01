import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    courtId?: Id<"courts">;
    /** Pre-select a partner (e.g. from Court roster or player profile) */
    preselectedPartnerId?: Id<"users">;
}

export function NewTeamSheet({ isVisible, onClose, courtId, preselectedPartnerId }: Props) {
    const [teamName, setTeamName] = useState("");
    const [partnerId, setPartnerId] = useState<Id<"users"> | null>(
        preselectedPartnerId ?? null
    );
    const [sending, setSending] = useState(false);

    const currentUser = useQuery(api.users.currentUser);
    const checkIns = useQuery(
        api.checkIns.getCurrentCheckIns,
        courtId ? { courtId } : "skip"
    );
    const allUsers = useQuery(api.users.listAllUsers);
    const invitePartner = useMutation(api.teams.invitePartner);

    const canSubmit = teamName.trim().length >= 2 && !!partnerId;

    // Checked-in players first, then everyone else
    const checkedInIds = new Set(
        (checkIns ?? []).map((c) => c.user?._id).filter(Boolean)
    );
    const checkedInPlayers = (checkIns ?? [])
        .filter((c) => c.user?._id !== currentUser?._id)
        .map((c) => c.user!);

    const otherPlayers = (allUsers ?? [])
        .filter((u) => !checkedInIds.has(u._id))
        .slice(0, 30);

    const handleSend = async () => {
        if (!canSubmit || !partnerId || sending) return;
        setSending(true);
        try {
            await invitePartner({ inviteeId: partnerId, teamName: teamName.trim() });
            setTeamName("");
            setPartnerId(null);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={onClose} maxHeight="85%">
            <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                <Text style={{ color: "#f1f5f9", fontWeight: "700", fontSize: 20, marginBottom: 20 }}>
                    New Team
                </Text>

                {/* Team name */}
                <Text style={labelStyle}>Team Name</Text>
                <TextInput
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="e.g. The Dink Tanks"
                    placeholderTextColor="#374151"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.07)",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: teamName.length >= 2
                            ? "rgba(245,158,11,0.4)"
                            : "rgba(255,255,255,0.1)",
                        color: "#f1f5f9",
                        fontSize: 15,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 20,
                    }}
                    maxLength={32}
                />

                {/* Partner picker */}
                <Text style={labelStyle}>Invite Partner</Text>

                {allUsers === undefined ? (
                    <ActivityIndicator color="#f59e0b" style={{ marginVertical: 20 }} />
                ) : (
                    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        {checkedInPlayers.length > 0 && (
                            <>
                                <Text style={sectionStyle}>At the court now</Text>
                                {checkedInPlayers.map((u) => (
                                    <PlayerPill
                                        key={u._id}
                                        name={u.name ?? u.email ?? "Unknown"}
                                        selected={partnerId === u._id}
                                        onPress={() =>
                                            setPartnerId(partnerId === u._id ? null : u._id)
                                        }
                                    />
                                ))}
                                {otherPlayers.length > 0 && (
                                    <Text style={[sectionStyle, { marginTop: 12 }]}>
                                        Other players
                                    </Text>
                                )}
                            </>
                        )}
                        {otherPlayers.map((u) => (
                            <PlayerPill
                                key={u._id}
                                name={u.name ?? u.email ?? "Unknown"}
                                selected={partnerId === u._id}
                                onPress={() =>
                                    setPartnerId(partnerId === u._id ? null : u._id)
                                }
                            />
                        ))}
                        <View style={{ height: 8 }} />
                    </ScrollView>
                )}

                {/* Send invite */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSend}
                    disabled={!canSubmit || sending}
                    style={{
                        marginTop: 16,
                        paddingVertical: 14,
                        borderRadius: 16,
                        backgroundColor: canSubmit ? "rgba(245,158,11,0.9)" : "rgba(245,158,11,0.2)",
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    {sending ? (
                        <ActivityIndicator color="#151c0c" />
                    ) : (
                        <>
                            <Ionicons
                                name="people"
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
                                Send Invite
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

const sectionStyle = {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 6,
};
