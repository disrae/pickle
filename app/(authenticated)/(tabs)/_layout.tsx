import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import { WebTabBar } from "@/components/ui/WebTabBar";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={isWeb ? (props) => <WebTabBar {...props} /> : undefined}
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
                    borderTopColor: "rgba(255,255,255,0.08)",
                    height: 88,
                    paddingTop: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="court"
                options={{
                    title: "Court",
                    tabBarIcon: ({ focused, color, size }) => (
                        <CourtTabIcon focused={focused} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="coach"
                options={{
                    title: "Coach",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="compete"
                options={{
                    title: "Compete",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "trophy" : "trophy-outline"} color={focused ? "#f59e0b" : color} size={size} />
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
                }}
            />
            <Tabs.Screen name="drills" options={{ href: null }} />
            <Tabs.Screen name="builder" options={{ href: null }} />
        </Tabs>
    );
}
