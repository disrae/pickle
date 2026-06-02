import { GlassContainer } from "@/components/ui/GlassContainer";
import { RadarChart } from "@/components/ui/RadarChart";
import {
    buildRadarProgress,
    buildSkillRows,
    MAX_SKILL_LEVEL,
    type SkillProfileNumbers,
} from "@/lib/skills-profile-display";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type SkillsProfileCardProps = {
    profile: SkillProfileNumbers;
    title?: string;
};

export function SkillsProfileCard({
    profile,
    title = "Skills profile",
}: SkillsProfileCardProps) {
    const skillRows = buildSkillRows(profile);
    const radarProgress = buildRadarProgress(skillRows);

    return (
        <GlassContainer style={{ borderRadius: 24, padding: 20 }}>
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <Ionicons name="stats-chart" size={20} color="#3F7D20" />
                    <Text className="text-foreground text-lg font-bold ml-2">{title}</Text>
                </View>
                {typeof profile.overallLevel === "number" && (
                    <View className="items-end">
                        <Text className="text-brand text-2xl font-bold leading-6">
                            {profile.overallLevel.toFixed(1)}
                        </Text>
                        <Text className="text-muted-foreground text-xs">overall</Text>
                    </View>
                )}
            </View>

            {skillRows.length > 0 && (
                <View className="items-center my-2">
                    <RadarChart skillProgress={radarProgress} size={280} />
                </View>
            )}

            <View className="mt-2">
                {skillRows.map((r) => (
                    <View key={r.label} className="flex-row items-center py-2">
                        <Text className="text-foreground font-semibold w-24">{r.label}</Text>
                        <View className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden mr-3">
                            <View
                                className="h-full bg-brand rounded-full"
                                style={{
                                    width: `${Math.min(100, (r.value / MAX_SKILL_LEVEL) * 100)}%`,
                                }}
                            />
                        </View>
                        <Text className="text-foreground text-sm w-9 text-right">
                            {r.value.toFixed(1)}
                        </Text>
                    </View>
                ))}
            </View>
        </GlassContainer>
    );
}
