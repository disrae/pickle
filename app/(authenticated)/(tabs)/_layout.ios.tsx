import { AppTabBar } from "@/components/ui/AppTabBar";
import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import {
    TabBarVisibilityProvider,
    useTabBarVisibility,
} from "@/lib/tab-bar-visibility";
import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

function LiquidGlassTabs() {
    const { hidden } = useTabBarVisibility();
    return (
        <NativeTabs tintColor="#3F7D20" {...({ hidden } as { hidden?: boolean })}>
            <NativeTabs.Trigger name="court">
                <NativeTabs.Trigger.Label hidden>Court</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="figure.pickleball.circle.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="coach">
                <NativeTabs.Trigger.Label hidden>Coach</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="compete">
                <NativeTabs.Trigger.Label hidden>Compete</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="trophy.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.fill" />
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
                tabBarActiveTintColor: "#3F7D20",
                tabBarInactiveTintColor: "#5C6454",
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
                            color={focused ? "#B45309" : color}
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
