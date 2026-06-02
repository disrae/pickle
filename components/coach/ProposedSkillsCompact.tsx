import { PROPOSED_SKILLS_INTRO } from "@/components/coach/coach-copy";
import { GlassContainer } from "@/components/ui/GlassContainer";
import {
    buildSkillRows,
    MAX_SKILL_LEVEL,
    type SkillProfileNumbers,
} from "@/lib/skills-profile-display";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type ProposedSkillsCompactProps = {
    profile: SkillProfileNumbers;
    onConfirm: () => void | Promise<void>;
    confirming?: boolean;
};

export function ProposedSkillsCompact({
    profile,
    onConfirm,
    confirming = false,
}: ProposedSkillsCompactProps) {
    const rows = buildSkillRows(profile);

    return (
        <View className="mt-2 mb-1 w-full max-w-[400px] self-start">
            <GlassContainer style={{ borderRadius: 16, padding: 14 }}>
                <Text className="text-foreground text-sm leading-5 mb-3">{PROPOSED_SKILLS_INTRO}</Text>
                {typeof profile.overallLevel === "number" && (
                    <Text className="text-brand text-sm font-bold mb-2">
                        Overall {profile.overallLevel.toFixed(1)}
                    </Text>
                )}
                {rows.map((r) => (
                    <View key={r.label} className="flex-row items-center gap-2 mb-1.5">
                        <Text className="text-muted-foreground text-xs w-[4.25rem]" numberOfLines={1}>
                            {r.label}
                        </Text>
                        <View className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-brand rounded-full"
                                style={{
                                    width: `${Math.min(100, (r.value / MAX_SKILL_LEVEL) * 100)}%`,
                                }}
                            />
                        </View>
                        <Text className="text-foreground text-xs w-6 text-right">
                            {r.value.toFixed(1)}
                        </Text>
                    </View>
                ))}
                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={confirming}
                    onPress={() => void onConfirm()}
                    className="mt-2 bg-brand rounded-xl py-2.5 items-center"
                >
                    {confirming ? (
                        <ActivityIndicator color="#f7fbf0" size="small" />
                    ) : (
                        <Text className="text-brand-foreground text-sm font-bold">OK</Text>
                    )}
                </TouchableOpacity>
            </GlassContainer>
        </View>
    );
}
