import { GlassContainer } from "@/components/ui/GlassContainer";
import { IconTile } from "@/components/ui/IconTile";
import { StyledButton } from "@/components/ui/StyledButton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export function CoachPromptBanner() {
    const router = useRouter();
    const startInterview = useMutation(api.coach.startInterview);
    const currentUser = useQuery(api.users.currentUser);

    if (currentUser?.coachOnboardingComplete) return null;

    const handlePress = async () => {
        await startInterview({});
        router.replace("/(authenticated)/(tabs)/coach/chat");
    };

    return (
        <GlassContainer style={{ padding: 20, marginBottom: 14 }}>
            <View className="flex-row items-center gap-3.5">
                <IconTile name="sparkles" tone="brand" />
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-foreground text-lg font-bold">Meet your coach</Text>
                        <View className="px-2 py-0.5 rounded-full bg-brand-subtle">
                            <Text className="text-brand-strong text-[10px] font-bold uppercase tracking-wide">New</Text>
                        </View>
                    </View>
                    <Text className="text-muted-foreground text-base mt-1">
                        A quick chat to build your skills profile and a personalized plan.
                    </Text>
                </View>
            </View>
            <View className="mt-4">
                <StyledButton variant="brand" title="Build my profile" onPress={handlePress} />
            </View>
        </GlassContainer>
    );
}
