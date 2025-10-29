import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    if (isLiquidGlassAvailable()) {
        return (
            <NativeTabs
                tintColor="#65a30d" // active color
                labelStyle={{
                    fontSize: 14,
                    fontWeight: '600',
                }}
                blurEffect={undefined}
            >
                <NativeTabs.Trigger name="index">
                    <Label>Court</Label>
                    <Icon sf="figure.pickleball" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="training">
                    <Label>Training</Label>
                    <Icon sf="dumbbell.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="profile">
                    <Label>Profile</Label>
                    <Icon sf="person.circle.fill" />
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    } else {
        return (
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#65a30d", // lime-700
                    tabBarInactiveTintColor: "#64748b", // slate-500
                    tabBarStyle: {
                        backgroundColor: "#ffffff",
                        borderTopWidth: 1,
                        borderTopColor: "#e2e8f0", // slate-200
                    },
                    tabBarLabelStyle: {
                        fontSize: 14,
                        fontWeight: "600",
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Court",
                        tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
                    }}
                />
                <Tabs.Screen
                    name="training"
                    options={{
                        title: "Training",
                        tabBarIcon: ({ color, size }) => <Ionicons name="fitness" color={color} size={size} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
                    }}
                />
            </Tabs>
        );
    }
}
