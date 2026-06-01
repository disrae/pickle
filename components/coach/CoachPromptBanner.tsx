import { GlassContainer } from "@/components/ui/GlassContainer";
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
        router.push("/(authenticated)/(tabs)/coach");
    };

    return (
        <GlassContainer style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <View className="flex-row items-center gap-3">
                <Text className="text-3xl">🎾</Text>
                <View className="flex-1">
                    <Text className="text-foreground text-lg font-bold">
                        Your coach wants to chat
                    </Text>
                    <Text className="text-muted-foreground text-sm mt-1">
                        2-min interview to build your skills profile
                    </Text>
                </View>
            </View>
            <View className="mt-4">
                <StyledButton variant="brand" title="Let's go" onPress={handlePress} />
            </View>
        </GlassContainer>
    );
}
