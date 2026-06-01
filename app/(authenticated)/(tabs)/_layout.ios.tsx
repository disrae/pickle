import { AppTabBar } from "@/components/ui/AppTabBar";
import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import {
    TabBarVisibilityProvider,
    useTabBarVisibility,
} from "@/lib/tab-bar-visibility";
import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

function LiquidGlassTabs() {
    const { hidden } = useTabBarVisibility();
    return (
        <NativeTabs tintColor="#a3e635" {...({ hidden } as { hidden?: boolean })}>
            <NativeTabs.Trigger name="court">
                <Label hidden>Court</Label>
                <Icon sf="figure.pickleball.circle.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="coach">
                <Label hidden>Coach</Label>
                <Icon sf="bubble.left.and.bubble.right.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="compete">
                <Label hidden>Compete</Label>
                <Icon sf="trophy.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <Label hidden>Profile</Label>
                <Icon sf="person.fill" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

function JsTabs() {
    const { hidden } = useTabBarVisibility();

    return (
        <Tabs
            tabBar={hidden ? () => null : (props) => <AppTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#a3e635",
                tabBarInactiveTintColor: "#8a9482",
            }}
        >
            <Tabs.Screen name="index" options={{ href: null }} />
            <Tabs.Screen
                name="court"
                options={{
                    title: "Court",
                    tabBarIcon: ({ focused, color, size }) => (
                        <CourtTabIcon focused={focused} color={color} size={size * 1.1} />
                    ),
                }}
            />
            <Tabs.Screen
                name="coach"
                options={{
                    title: "Coach",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                            color={color}
                            size={size * 1.1}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="compete"
                options={{
                    title: "Compete",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? "trophy" : "trophy-outline"}
                            color={focused ? "#f59e0b" : color}
                            size={size * 1.1}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size * 1.1} />
                    ),
                }}
            />
        </Tabs>
    );
}

export default function TabLayout() {
    return (
        <TabBarVisibilityProvider>
            {isLiquidGlassAvailable() ? <LiquidGlassTabs /> : <JsTabs />}
        </TabBarVisibilityProvider>
    );
}
