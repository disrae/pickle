import { Background } from "@/components/ui/Background";
import { CreateFeatureCard } from "@/components/ui/CreateFeatureCard";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { BuilderFAB } from "@/components/ui/TrainingFAB";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useHeaderHeight } from "@/lib/header-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BuilderScreen() {
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const features = useQuery(api.featureRequests.list);
    useQuery(api.users.currentUser);

    const sortedFeatures = features ? [...features].sort((a, b) => b.voteCount - a.voteCount) : [];

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: Math.max(bottom, 32) + 80,
                }}
                showsVerticalScrollIndicator={false}
            >
                <GlassContainer
                    style={{
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 16,
                    }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bulb" size={20} color="#84cc16" />
                        <Text className="text-slate-300 text-sm ml-2 flex-1">
                            Vote for features or submit your own ideas
                        </Text>
                    </View>
                </GlassContainer>

                {!features ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#84cc16" />
                    </View>
                ) : sortedFeatures.length > 0 ? (
                    sortedFeatures.map((feature) => (
                        <FeatureCard key={feature._id} feature={feature} />
                    ))
                ) : (
                    <GlassContainer
                        style={{
                            borderRadius: 16,
                            padding: 24,
                        }}
                    >
                        <View className="items-center">
                            <Ionicons name="rocket-outline" size={48} color="#cbd5e1" />
                            <Text className="text-slate-300 text-center mt-4">
                                No features yet. Be the first to suggest one!
                            </Text>
                        </View>
                    </GlassContainer>
                )}
            </ScrollView>

            <Header
                title="Builder"
                titleSize="text-2xl"
                leftButton="back"
                onLeftPress={() => router.back()}
                rightButton="chat"
                onRightPress={() => router.push("/builder/chats")}
            />

            <BuilderFAB onPress={() => setShowCreateModal(true)} />

            <CreateFeatureCard
                isVisible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </Background>
    );
}
