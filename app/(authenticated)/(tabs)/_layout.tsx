import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import { WebTabBar } from "@/components/ui/WebTabBar";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export default function TabsLayout() {
    const user = useQuery(api.users.currentUser);
    return (
        <Tabs
            tabBar={isWeb ? (props) => <WebTabBar {...props} /> : undefined}
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
                    height: 88,
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
                    tabBarIcon: ({ focused, size }) => <CourtTabIcon focused={focused} size={size} />,
                }}
            />
            <Tabs.Screen
                name="drills"
                options={{
                    title: "Drills",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "barbell" : "barbell-outline"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="builder"
                options={{
                    title: "Builder",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "construct" : "construct-outline"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
                    ),
                    href: user ? "/profile" : null,
                }}
            />
        </Tabs>
    );
}
