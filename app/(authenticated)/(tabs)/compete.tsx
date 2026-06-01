import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { useTabBarHeight } from "@/lib/tab-bar-layout";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompeteScreen() {
    const { top } = useSafeAreaInsets();
    const tabBarHeight = useTabBarHeight();
    const headerHeight = top + 60;

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: tabBarHeight + 16,
                    flexGrow: 1,
                    justifyContent: "center",
                }}
            >
                <GlassContainer
                    style={{
                        borderRadius: 28,
                        padding: 32,
                        borderWidth: 1,
                        borderColor: "rgba(245, 158, 11, 0.3)",
                    }}
                >
                    <View className="items-center">
                        <Ionicons name="trophy" size={56} color="#f59e0b" />
                        <Text className="text-competition text-2xl font-bold mt-4 text-center">
                            Compete
                        </Text>
                        <Text className="text-muted-foreground text-center mt-3 leading-6">
                            Rolling tournament, teams, and rankings — coming soon. Challenge
                            players at your court and climb the ladder.
                        </Text>
                    </View>
                </GlassContainer>
            </ScrollView>
            <Header title="Compete" />
        </Background>
    );
}
