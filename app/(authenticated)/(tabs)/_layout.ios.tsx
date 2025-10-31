import { PicklePaddle } from "@/assets/icons/picklepaddle";
import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    if (isLiquidGlassAvailable()) {
        return (
            <NativeTabs tintColor="#65a30d">
                <NativeTabs.Trigger name="index"  >
                    <Label hidden>Court</Label>
                    <Icon sf="figure.pickleball" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="drills" >
                    <Label hidden>Drills</Label>
                    <Icon sf="dumbbell.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="builder" >
                    <Label hidden>Builder</Label>
                    <Icon sf="hammer.fill" />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="profile" >
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
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: "#65a30d", // lime-700
                    tabBarInactiveTintColor: "#94a3b8", // slate-600
                    tabBarStyle: {
                        backgroundColor: "#ffffff",
                        borderTopWidth: 1,
                        borderTopColor: "#e2e8f0", // slate-200
                        paddingTop: 10,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Court",
                        tabBarIcon: ({ color, size }) => <PicklePaddle width={size * 1.2} height={size * 1.2} tintColor={color} />,
                    }}
                />
                <Tabs.Screen
                    name="drills"
                    options={{
                        title: "Drills",
                        tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" color={color} size={size * 1.2} />,
                    }}
                />
                <Tabs.Screen
                    name="builder"
                    options={{
                        title: "Builder",
                        tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size * 1.2} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size * 1.2} />,
                    }}
                />
            </Tabs>
        );
    }
}
