import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    TextInput,
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
    const [myTeamId, setMyTeamId] = useState<Id<"teams"> | null>(null);
    const [opponentId, setOpponentId] = useState<Id<"users"> | null>(
        preselectedOpponentId ?? null
    );
    const [opponentTeamId, setOpponentTeamId] = useState<Id<"teams"> | null>(
        preselectedOpponentTeamId ?? null
    );
    const [opponentPartnerId, setOpponentPartnerId] = useState<Id<"users"> | null>(null);
    const [playerSearch, setPlayerSearch] = useState("");
    const [slots, setSlots] = useState<Array<{ day: number; hour: number }>>([
        { day: 1, hour: 15 },
        { day: 2, hour: 15 },
    ]);
    const [sending, setSending] = useState(false);

    const currentUser = useQuery(api.users.currentUser);
    const myTeams = useQuery(api.teams.myTeams);
    const allTeams = useQuery(api.teams.teamsByRating, { courtId });
    const allUsers = useQuery(api.users.listAllUsers);
    const issueChallenge = useMutation(api.challenges.issueChallenge);

    const myTeam = myTeams?.find((t) => t._id === myTeamId) ?? null;
    const challengerPartnerId = myTeam?.partner?._id ?? null;

    useEffect(() => {
        if (!isVisible) return;
        setOpponentId(preselectedOpponentId ?? null);
        setOpponentTeamId(preselectedOpponentTeamId ?? null);
        setMyTeamId(null);
    }, [isVisible, preselectedOpponentId, preselectedOpponentTeamId]);

    // Resolve opponent players from preselected team
    useEffect(() => {
        if (!opponentTeamId || !allTeams) return;
        const team = allTeams.find((t) => t._id === opponentTeamId);
        if (!team) return;
        setOpponentId(team.player1Id);
        setOpponentPartnerId(team.player2Id);
        setFormat("doubles");
    }, [opponentTeamId, allTeams]);

    const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
    const HOUR_OPTIONS = [9, 11, 13, 15, 17, 19];

    const toTimestamp = (dayOffset: number, hour: number) => {
        const dt = new Date();
        dt.setMinutes(0, 0, 0);
        dt.setDate(dt.getDate() + dayOffset);
        dt.setHours(hour);
        return dt.getTime();
    };

    const proposedTimes = useMemo(() => {
        return [...new Set(slots.map((s) => toTimestamp(s.day, s.hour)))].sort((a, b) => a - b);
    }, [slots]);

    const canSubmit =
        format === "singles"
            ? !!opponentId && proposedTimes.length >= 2
            : !!myTeamId && !!opponentId && !!opponentPartnerId && proposedTimes.length >= 2;

    const singlesSearch = playerSearch.trim().toLowerCase();
    const visibleOpponents = (allUsers ?? []).filter((u) => {
        if (u._id === currentUser?._id) return false;
        if (!singlesSearch) return true;
        return `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(singlesSearch);
    });

    const handleSend = async () => {
        if (!opponentId || sending) return;
        if (proposedTimes.length < 2) return;
        setSending(true);
        try {
            await issueChallenge({
                challengedId: opponentId,
                challengedPartnerId: opponentPartnerId ?? undefined,
                challengedTeamId: opponentTeamId ?? undefined,
                challengerPartnerId: challengerPartnerId ?? undefined,
                challengerTeamId: myTeamId ?? undefined,
                format,
                courtId,
                proposedTimes,
            });
            onClose();
            setMyTeamId(null);
            setOpponentId(preselectedOpponentId ?? null);
            setOpponentTeamId(preselectedOpponentTeamId ?? null);
            setOpponentPartnerId(null);
            setPlayerSearch("");
            setSlots([{ day: 1, hour: 15 }, { day: 2, hour: 15 }]);
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={onClose} maxHeight="80%" tone="light">
            <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                {/* Title */}
                <Text
                    style={{
                        color: "#12170f",
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
                                setMyTeamId(null);
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
                                            : "rgba(18,23,15,0.04)",
                                    borderWidth: 1,
                                    borderColor:
                                        format === f
                                            ? "rgba(245,158,11,0.4)"
                                            : "rgba(18,23,15,0.12)",
                                }}
                            >
                                <Text
                                    style={{
                                        color: format === f ? "#B45309" : "#5c6454",
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

                <Text style={labelStyle}>Propose Times (pick 2–3)</Text>
                <TimeSlotPicker
                    slots={slots}
                    onSlotsChange={setSlots}
                    dayOptions={DAY_OPTIONS}
                    hourOptions={HOUR_OPTIONS}
                />

                {format === "doubles" ? (
                    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                        {/* Your team */}
                        <Text style={labelStyle}>Your Team</Text>
                        {myTeams === undefined ? (
                            <ActivityIndicator color="#B45309" style={{ marginVertical: 12 }} />
                        ) : myTeams.length === 0 ? (
                            <View
                                style={{
                                    padding: 14,
                                    borderRadius: 14,
                                    backgroundColor: "rgba(18,23,15,0.04)",
                                    borderWidth: 1,
                                    borderColor: "rgba(18,23,15,0.08)",
                                    marginBottom: 16,
                                }}
                            >
                                <Text style={{ color: "#5c6454", fontSize: 13, textAlign: "center" }}>
                                    You have no teams yet. Create one from the Teams tab first.
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 6, marginBottom: 16 }}>
                                {myTeams.map((team) => (
                                    <TeamCard
                                        key={team._id}
                                        name={team.name}
                                        partnerName={team.partner?.name ?? "Unknown"}
                                        rating={team.rating}
                                        selected={myTeamId === team._id}
                                        onPress={() =>
                                            setMyTeamId(myTeamId === team._id ? null : team._id)
                                        }
                                    />
                                ))}
                            </View>
                        )}

                        {/* Opponent team */}
                        <Text style={labelStyle}>Opponent Team</Text>
                        {opponentTeamId ? (
                            // Pre-selected — show as a locked card with a change button
                            (() => {
                                const ot = allTeams?.find((t) => t._id === opponentTeamId);
                                return ot ? (
                                    <View style={{ marginBottom: 16 }}>
                                        <TeamCard
                                            name={ot.name}
                                            partnerName={`${ot.player1?.name ?? "?"} · ${ot.player2?.name ?? "?"}`}
                                            rating={ot.rating}
                                            selected
                                            onPress={() => {
                                                setOpponentTeamId(null);
                                                setOpponentId(null);
                                                setOpponentPartnerId(null);
                                            }}
                                            trailingIcon="close-circle-outline"
                                        />
                                    </View>
                                ) : (
                                    <ActivityIndicator color="#B45309" style={{ marginBottom: 16 }} />
                                );
                            })()
                        ) : allTeams === undefined ? (
                            <ActivityIndicator color="#B45309" style={{ marginVertical: 12 }} />
                        ) : (
                            <View style={{ gap: 6, marginBottom: 16 }}>
                                {allTeams
                                    .filter((t) => t._id !== myTeamId)
                                    .map((team) => (
                                        <TeamCard
                                            key={team._id}
                                            name={team.name}
                                            partnerName={`${team.player1?.name ?? "?"} · ${team.player2?.name ?? "?"}`}
                                            rating={team.rating}
                                            selected={opponentTeamId === team._id}
                                            onPress={() => {
                                                setOpponentTeamId(team._id);
                                                setOpponentId(team.player1Id);
                                                setOpponentPartnerId(team.player2Id);
                                            }}
                                        />
                                    ))}
                            </View>
                        )}
                        <View style={{ height: 8 }} />
                    </ScrollView>
                ) : (
                    // Singles — just pick the opponent player
                    <>
                        <Text style={labelStyle}>Opponent</Text>
                        <TextInput
                            value={playerSearch}
                            onChangeText={setPlayerSearch}
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
                            <ActivityIndicator color="#B45309" />
                        ) : (
                            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                                {visibleOpponents.map((u) => (
                                    <PlayerPill
                                        key={u._id}
                                        name={u.name ?? u.email ?? "Unknown"}
                                        selected={opponentId === u._id}
                                        onPress={() =>
                                            setOpponentId(opponentId === u._id ? null : u._id)
                                        }
                                    />
                                ))}
                                {visibleOpponents.length === 0 && (
                                    <Text style={{ color: "#5c6454", textAlign: "center", marginVertical: 12 }}>
                                        No players match your search
                                    </Text>
                                )}
                                <View style={{ height: 8 }} />
                            </ScrollView>
                        )}
                    </>
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
                                color={canSubmit ? "#151c0c" : "#B45309"}
                            />
                            <Text
                                style={{
                                    color: canSubmit ? "#151c0c" : "#B45309",
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

function TeamCard({
    name,
    partnerName,
    rating,
    selected,
    onPress,
    trailingIcon,
}: {
    name: string;
    partnerName: string;
    rating: number;
    selected: boolean;
    onPress: () => void;
    trailingIcon?: string;
}) {
    return (
        <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: selected
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(18,23,15,0.03)",
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
                        flexShrink: 0,
                    }}
                >
                    {selected && !trailingIcon && (
                        <Ionicons name="checkmark" size={12} color="#151c0c" />
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: selected ? "#12170f" : "#5c6454",
                            fontWeight: selected ? "700" : "500",
                            fontSize: 14,
                        }}
                    >
                        {name}
                    </Text>
                    <Text style={{ color: "#8b9382", fontSize: 12, marginTop: 1 }}>
                        {partnerName}
                    </Text>
                </View>
                <Text
                    style={{
                        color: selected ? "#B45309" : "#8b9382",
                        fontWeight: "700",
                        fontSize: 14,
                        marginLeft: 8,
                    }}
                >
                    {rating}
                </Text>
                {trailingIcon && (
                    <Ionicons
                        name={trailingIcon as any}
                        size={18}
                        color="rgba(180,83,9,0.5)"
                        style={{ marginLeft: 8 }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

function TimeSlotPicker({
    slots,
    onSlotsChange,
    dayOptions,
    hourOptions,
}: {
    slots: Array<{ day: number; hour: number }>;
    onSlotsChange: (slots: Array<{ day: number; hour: number }>) => void;
    dayOptions: number[];
    hourOptions: number[];
}) {
    const [stagingDay, setStagingDay] = useState<number | null>(null);

    const removeSlot = (idx: number) => {
        onSlotsChange(slots.filter((_, i) => i !== idx));
    };

    const addSlot = (day: number, hour: number) => {
        if (slots.some((s) => s.day === day && s.hour === hour)) return;
        onSlotsChange([...slots, { day, hour }]);
        setStagingDay(null);
    };

    const canAddMore = slots.length < 3;

    return (
        <View style={{ marginBottom: 14 }}>
            {/* Selected slots */}
            {slots.map((slot, i) => (
                <View
                    key={i}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 12,
                        backgroundColor: "rgba(245,158,11,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(245,158,11,0.3)",
                        marginBottom: 6,
                    }}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#B45309"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={{ flex: 1, color: "#B45309", fontWeight: "600", fontSize: 13 }}>
                        {formatSlot(slot.day, slot.hour)}
                    </Text>
                    <TouchableOpacity
                        onPress={() => removeSlot(i)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="close-circle" size={18} color="rgba(180,83,9,0.5)" />
                    </TouchableOpacity>
                </View>
            ))}

            {/* Add-slot card */}
            {canAddMore && (
                <GlassContainer
                    style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor:
                            stagingDay !== null
                                ? "rgba(245,158,11,0.3)"
                                : "rgba(18,23,15,0.08)",
                        overflow: "hidden",
                    }}
                >
                    {stagingDay === null ? (
                        <View style={{ padding: 10 }}>
                            <Text
                                style={{
                                    color: "#5c6454",
                                    fontSize: 11,
                                    fontWeight: "600",
                                    marginBottom: 6,
                                }}
                            >
                                {slots.length === 0 ? "PICK A DAY" : "+ ADD ANOTHER — PICK A DAY"}
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                {dayOptions.map((d) => (
                                    <Chip
                                        key={d}
                                        label={dayLabel(d)}
                                        active={false}
                                        onPress={() => setStagingDay(d)}
                                    />
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={{ padding: 10 }}>
                            <TouchableOpacity
                                onPress={() => setStagingDay(null)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons name="chevron-back" size={14} color="#B45309" />
                                <Text
                                    style={{
                                        color: "#B45309",
                                        fontWeight: "700",
                                        fontSize: 13,
                                    }}
                                >
                                    {dayLabel(stagingDay)}
                                </Text>
                                <Text style={{ color: "#5c6454", fontSize: 11, marginLeft: 2 }}>
                                    — pick a time
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                {hourOptions.map((h) => {
                                    const taken = slots.some(
                                        (s) => s.day === stagingDay && s.hour === h
                                    );
                                    return (
                                        <Chip
                                            key={h}
                                            label={formatHour(h)}
                                            active={false}
                                            disabled={taken}
                                            onPress={() => addSlot(stagingDay, h)}
                                        />
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </GlassContainer>
            )}

            {slots.length < 2 && (
                <Text
                    style={{
                        color: "#B45309",
                        fontSize: 11,
                        fontWeight: "600",
                        marginTop: 4,
                    }}
                >
                    Add at least 2 times
                </Text>
            )}
        </View>
    );
}

function dayLabel(offset: number): string {
    if (offset === 1) return "Tomorrow";
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatSlot(dayOffset: number, hour: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function Chip({
    label,
    active,
    disabled,
    onPress,
}: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}>
            <View
                style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: disabled
                        ? "rgba(18,23,15,0.06)"
                        : active
                          ? "rgba(245,158,11,0.5)"
                          : "rgba(18,23,15,0.15)",
                    backgroundColor: disabled
                        ? "rgba(18,23,15,0.02)"
                        : active
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(18,23,15,0.03)",
                }}
            >
                <Text
                    style={{
                        color: disabled ? "rgba(18,23,15,0.2)" : active ? "#B45309" : "#5c6454",
                        fontSize: 12,
                        fontWeight: "600",
                    }}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function formatHour(hour24: number) {
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hr = hour24 % 12 || 12;
    return `${hr}:00 ${suffix}`;
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
