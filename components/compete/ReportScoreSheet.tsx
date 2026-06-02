import { BottomSheetCard } from "@/components/ui/BottomSheetCard";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    match: {
        matchId?: Id<"matches">;
        challengeId?: Id<"challenges">;
        courtId: Id<"courts">;
        format: "doubles" | "singles";
        p1Id: Id<"users">;
        p2Id?: Id<"users">;
        p3Id: Id<"users">;
        p4Id?: Id<"users">;
        team1Id?: Id<"teams">;
        team2Id?: Id<"teams">;
        /** Display names */
        team1Name: string;
        team2Name: string;
    } | null;
    /** If set, this is a confirmation of an already-reported match */
    isConfirming?: boolean;
    onConfirmed?: () => void;
}

export function ReportScoreSheet({
    isVisible,
    onClose,
    match,
    isConfirming = false,
    onConfirmed,
}: Props) {
    const [score1, setScore1] = useState("");
    const [score2, setScore2] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reportMatch = useMutation(api.challenges.reportMatch);
    const confirmMatch = useMutation(api.challenges.confirmMatch);

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    const canSubmit =
        !isNaN(s1) && !isNaN(s2) && s1 >= 0 && s2 >= 0 && s1 !== s2;

    const handleSubmit = async () => {
        if (!match || !canSubmit || submitting) return;
        setSubmitting(true);
        try {
            if (isConfirming && match.matchId) {
                await confirmMatch({ matchId: match.matchId });
            } else {
                await reportMatch({
                    challengeId: match.challengeId,
                    courtId: match.courtId,
                    format: match.format,
                    p1Id: match.p1Id,
                    p2Id: match.p2Id,
                    p3Id: match.p3Id,
                    p4Id: match.p4Id,
                    team1Id: match.team1Id,
                    team2Id: match.team2Id,
                    score1: s1,
                    score2: s2,
                });
            }
            setScore1("");
            setScore2("");
            onConfirmed?.();
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (!match) return null;

    return (
        <BottomSheetCard isVisible={isVisible} onClose={onClose} maxHeight="60%" tone="light">
            <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
                <Text
                    style={{
                        color: "#12170f",
                        fontWeight: "700",
                        fontSize: 20,
                        marginBottom: 6,
                    }}
                >
                    {isConfirming ? "Confirm Score" : "Report Score"}
                </Text>
                <Text style={{ color: "#5c6454", fontSize: 13, marginBottom: 24 }}>
                    {match.format === "doubles" ? "Doubles" : "Singles"} ·{" "}
                    {isConfirming
                        ? "Does this score look right?"
                        : "Enter the final score"}
                </Text>

                {/* Score inputs */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    {/* Team 1 */}
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <Text
                            style={{
                                color: "#5c6454",
                                fontSize: 12,
                                fontWeight: "600",
                                marginBottom: 8,
                                textAlign: "center",
                            }}
                            numberOfLines={1}
                        >
                            {match.team1Name}
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: "#f3f4ef",
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: score1
                                    ? "rgba(245,158,11,0.5)"
                                    : "rgba(18,23,15,0.12)",
                                color: "#12170f",
                                fontSize: 36,
                                fontFamily: "Archivo_800ExtraBold",
                                textAlign: "center",
                                width: 80,
                                height: 72,
                            }}
                            value={score1}
                            onChangeText={(t) => setScore1(t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholder="0"
                            placeholderTextColor="#c4c9bd"
                            editable={!isConfirming}
                        />
                    </View>

                    <Text style={{ color: "#c4c9bd", fontSize: 28, fontWeight: "300" }}>–</Text>

                    {/* Team 2 */}
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <Text
                            style={{
                                color: "#5c6454",
                                fontSize: 12,
                                fontWeight: "600",
                                marginBottom: 8,
                                textAlign: "center",
                            }}
                            numberOfLines={1}
                        >
                            {match.team2Name}
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: "#f3f4ef",
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: score2
                                    ? "rgba(245,158,11,0.5)"
                                    : "rgba(18,23,15,0.12)",
                                color: "#12170f",
                                fontSize: 36,
                                fontFamily: "Archivo_800ExtraBold",
                                textAlign: "center",
                                width: 80,
                                height: 72,
                            }}
                            value={score2}
                            onChangeText={(t) => setScore2(t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholder="0"
                            placeholderTextColor="#c4c9bd"
                            editable={!isConfirming}
                        />
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSubmit}
                    disabled={!canSubmit || submitting}
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
                    }}
                >
                    {submitting ? (
                        <ActivityIndicator color="#151c0c" />
                    ) : (
                        <>
                            <Ionicons
                                name={isConfirming ? "checkmark-circle" : "trophy"}
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
                                {isConfirming ? "Confirm Result" : "Report Result"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </BottomSheetCard>
    );
}
