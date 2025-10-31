import { PicklePaddle } from "@/assets/icons/picklepaddle";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#65a30d", // lime-700
                tabBarInactiveTintColor: "#64748b", // slate-500
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e2e8f0", // slate-200
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, size }) => <PicklePaddle width={size} height={size} tintColor={color} />,
                }}
            />
            <Tabs.Screen
                name="drills"
                options={{
                    title: "Drills",
                    tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="builder"
                options={{
                    title: "Builder",
                    tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
