import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    const user = useQuery(api.users.currentUser);
    if (isLiquidGlassAvailable()) {
        return (
            <NativeTabs tintColor="#a3e635">
                <NativeTabs.Trigger name="court"  >
                    <Label hidden>Court</Label>
                    <Icon sf="figure.pickleball.circle.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="drills" >
                    <Label hidden>Drills</Label>
                    <Icon sf="dumbbell.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="builder" >
                    <Label hidden>Builder</Label>
                    <Icon sf="hammer.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="profile" hidden={!user}>
                    <Label hidden>Profile</Label>
                    <Icon sf="person.fill" />
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    } else {
        return (
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: "#a3e635", // Volt
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
                        borderTopColor: "rgba(255,255,255,0.08)",
                        paddingTop: 10,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        href: null,
                    }}
                />
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
                    name="drills"
                    options={{
                        title: "Drills",
                        tabBarIcon: ({ focused, color, size }) => (
                            <Ionicons name={focused ? "barbell" : "barbell-outline"} color={color} size={size * 1.1} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="builder"
                    options={{
                        title: "Builder",
                        tabBarIcon: ({ focused, color, size }) => (
                            <Ionicons name={focused ? "construct" : "construct-outline"} color={color} size={size * 1.1} />
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
                        href: user ? "/profile" : null,
                    }}
                />
            </Tabs>
        );
    }
}
