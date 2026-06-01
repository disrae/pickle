import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    if (isLiquidGlassAvailable()) {
        return (
            <NativeTabs tintColor="#a3e635">
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

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: "#a3e635",
                tabBarInactiveTintColor: "#6b7563",
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.2,
                    marginTop: 2,
                },
                tabBarStyle: {
                    backgroundColor: "#0c100a",
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255, 0.08)",
                    paddingTop: 10,
                },
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
                        <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} color={color} size={size * 1.1} />
                    ),
                }}
            />
            <Tabs.Screen
                name="compete"
                options={{
                    title: "Compete",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "trophy" : "trophy-outline"} color={focused ? "#f59e0b" : color} size={size * 1.1} />
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
            <Tabs.Screen name="drills" options={{ href: null }} />
            <Tabs.Screen name="builder" options={{ href: null }} />
        </Tabs>
    );
}
