import { CoachNote } from "@/components/coach/CoachNote";
import { SkillsProfileCard } from "@/components/coach/SkillsProfileCard";
import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { buildSkillRows, lowestSkillRow } from "@/lib/skills-profile-display";
import { useTabBarHeight } from "@/lib/tab-bar-layout";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useHeaderHeight } from "@/lib/header-layout";

const COACH_NOTE_WITH_PROFILE =
    "Here are my guesses at your skills for now. Play with others or take the drills to re-assess.";

export default function CoachHubScreen() {
    const headerHeight = useHeaderHeight();
    const tabBarHeight = useTabBarHeight();
    const router = useRouter();
    const profile = useQuery(api.skillsProfiles.getForCurrentUser);

    const confirmed = !!profile?.confirmedAt;

    const goToChat = () => router.push("/(authenticated)/(tabs)/coach/chat");
    const goToDrills = (category?: string) =>
        router.push({
            pathname: "/drills",
            params: category ? { category } : {},
        });

    const skillRows = profile ? buildSkillRows(profile) : [];
    const focus = lowestSkillRow(skillRows);

    if (profile === undefined) {
        return (
            <Background>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#3F7D20" />
                </View>
                <Header title="Coach's Corner" />
            </Background>
        );
    }

    if (!confirmed) {
        return <Redirect href="/(authenticated)/(tabs)/coach/chat" />;
    }

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: tabBarHeight + 16,
                }}
            >
                <CoachNote>{COACH_NOTE_WITH_PROFILE}</CoachNote>

                {focus && (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => goToDrills(focus.category)}
                        className="mb-4"
                    >
                        <GlassContainer
                            style={{
                                borderRadius: 24,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: "rgba(63, 125, 32, 0.35)",
                            }}
                        >
                            <Text className="text-brand text-xs font-bold tracking-wide mb-1">
                                COACH&apos;S PICK
                            </Text>
                            <Text className="text-foreground text-lg font-bold">
                                Work on your {focus.label.toLowerCase()}
                            </Text>
                            <Text className="text-muted-foreground text-sm mt-1 mb-4">
                                Your lowest skill — a few drills here move the needle fastest.
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-foreground font-semibold">
                                    See {focus.label} drills
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#3F7D20" />
                            </View>
                        </GlassContainer>
                    </TouchableOpacity>
                )}

                <View className="mb-4">
                    <SkillsProfileCard profile={profile} />
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => goToDrills()}
                    className="mb-4"
                >
                    <GlassContainer style={{ borderRadius: 24, padding: 20 }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-11 h-11 rounded-2xl bg-surface-2 items-center justify-center mr-3">
                                    <Ionicons name="fitness" size={22} color="#3F7D20" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground text-base font-bold">
                                        Browse drills
                                    </Text>
                                    <Text className="text-muted-foreground text-sm">
                                        Filter by skill, track milestones
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#3F7D20" />
                        </View>
                    </GlassContainer>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.85} onPress={goToChat}>
                    <GlassContainer style={{ borderRadius: 24, padding: 20 }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-11 h-11 rounded-2xl bg-surface-2 items-center justify-center mr-3">
                                    <Ionicons name="chatbubbles" size={20} color="#3F7D20" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground text-base font-bold">
                                        Chat with coach
                                    </Text>
                                    <Text className="text-muted-foreground text-sm">
                                        Ask anything or update your levels
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#3F7D20" />
                        </View>
                    </GlassContainer>
                </TouchableOpacity>
            </ScrollView>

            <Header title="Coach's Corner" />
        </Background>
    );
}
