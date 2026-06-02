import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    Platform,
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
    const [partnerSearch, setPartnerSearch] = useState("");
    const [sending, setSending] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);

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

    const search = partnerSearch.trim().toLowerCase();
    const matchesSearch = (name?: string | null, email?: string | null) => {
        if (!search) return true;
        return (
            (name ?? "").toLowerCase().includes(search) ||
            (email ?? "").toLowerCase().includes(search)
        );
    };

    const visibleCheckedIn = checkedInPlayers.filter((u) =>
        matchesSearch(u.name, u.email)
    );
    const visibleOthers = otherPlayers.filter((u) => matchesSearch(u.name, u.email));

    const handleSend = async () => {
        if (!canSubmit || !partnerId || sending) return;
        setSending(true);
        try {
            await invitePartner({ inviteeId: partnerId, teamName: teamName.trim() });
            setTeamName("");
            setPartnerId(null);
            setPartnerSearch("");
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={onClose} maxHeight="85%" tone="light">
            <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 20, marginBottom: 20 }}>
                    New Team
                </Text>

                {/* Team name */}
                <Text style={labelStyle}>Team Name</Text>
                <TextInput
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="e.g. The Dink Tanks"
                    placeholderTextColor="#8b9382"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    underlineColorAndroid="transparent"
                    className="outline-none"
                    style={{
                        backgroundColor: nameFocused
                            ? "rgba(245,158,11,0.1)"
                            : "#f3f4ef",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: nameFocused
                            ? "rgba(245,158,11,0.55)"
                            : teamName.length >= 2
                              ? "rgba(245,158,11,0.4)"
                              : "rgba(18,23,15,0.12)",
                        color: "#12170f",
                        fontSize: 15,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 20,
                        ...(nameFocused
                            ? Platform.OS === "web"
                                ? { boxShadow: "0 0 0 3px rgba(245,158,11,0.22)" }
                                : {
                                      shadowColor: "#B45309",
                                      shadowOffset: { width: 0, height: 0 },
                                      shadowOpacity: 0.35,
                                      shadowRadius: 6,
                                  }
                            : {}),
                        ...(Platform.OS === "web" ? { outlineStyle: "none" as const } : {}),
                    }}
                    maxLength={32}
                />

                {/* Partner picker */}
                <Text style={labelStyle}>Invite Partner</Text>
                <TextInput
                    value={partnerSearch}
                    onChangeText={setPartnerSearch}
                    placeholder="Search players"
                    placeholderTextColor="#8b9382"
                    underlineColorAndroid="transparent"
                    className="outline-none"
                    style={{
                        backgroundColor: "#f3f4ef",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(18,23,15,0.12)",
                        color: "#12170f",
                        fontSize: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: 10,
                        ...(Platform.OS === "web" ? { outlineStyle: "none" as const } : {}),
                    }}
                />

                {allUsers === undefined ? (
                    <ActivityIndicator color="#B45309" style={{ marginVertical: 20 }} />
                ) : (
                    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        {visibleCheckedIn.length > 0 && (
                            <>
                                <Text style={sectionStyle}>At the court now</Text>
                                {visibleCheckedIn.map((u) => (
                                    <PlayerPill
                                        key={u._id}
                                        name={u.name ?? u.email ?? "Unknown"}
                                        selected={partnerId === u._id}
                                        onPress={() =>
                                            setPartnerId(partnerId === u._id ? null : u._id)
                                        }
                                    />
                                ))}
                                {visibleOthers.length > 0 && (
                                    <Text style={[sectionStyle, { marginTop: 12 }]}>
                                        Other players
                                    </Text>
                                )}
                            </>
                        )}
                        {visibleOthers.map((u) => (
                            <PlayerPill
                                key={u._id}
                                name={u.name ?? u.email ?? "Unknown"}
                                selected={partnerId === u._id}
                                onPress={() =>
                                    setPartnerId(partnerId === u._id ? null : u._id)
                                }
                            />
                        ))}
                        {visibleCheckedIn.length === 0 && visibleOthers.length === 0 && (
                            <Text style={{ color: "#5c6454", textAlign: "center", marginVertical: 14 }}>
                                No players match "{partnerSearch.trim()}"
                            </Text>
                        )}
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
                                color={canSubmit ? "#151c0c" : "#B45309"}
                            />
                            <Text
                                style={{
                                    color: canSubmit ? "#151c0c" : "#B45309",
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
                        : "rgba(18,23,15,0.04)",
                    borderWidth: 1,
                    borderColor: selected
                        ? "rgba(245,158,11,0.4)"
                        : "rgba(18,23,15,0.08)",
                }}
            >
                <View
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? "#B45309" : "#c4c9bd",
                        backgroundColor: selected ? "#B45309" : "transparent",
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {selected && <Ionicons name="checkmark" size={12} color="#151c0c" />}
                </View>
                <Text
                    style={{
                        color: selected ? "#12170f" : "#5c6454",
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
    color: "#5c6454",
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
};

const sectionStyle = {
    color: "#5c6454",
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 6,
};
