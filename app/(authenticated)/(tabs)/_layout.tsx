import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
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

                    // height: 60,
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
