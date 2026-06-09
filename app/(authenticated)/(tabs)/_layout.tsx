import { AppTabBar } from "@/components/ui/AppTabBar";
import { CourtTabIcon } from "@/components/ui/CourtTabIcon";
import { WebTabBar } from "@/components/ui/WebTabBar";
import { useLocationCheckIn } from "@/lib/use-location-check-in";
import {
    TabBarVisibilityProvider,
    useTabBarVisibility,
} from "@/lib/tab-bar-visibility";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

function TabsLayoutInner() {
    const { hidden } = useTabBarVisibility();
    useLocationCheckIn();

    return (
        <Tabs
            tabBar={
                hidden
                    ? () => null
                    : isWeb
                      ? (props) => <WebTabBar {...props} />
                      : (props) => <AppTabBar {...props} />
            }
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
                    title: "League",
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
                        <Ionicons
                            name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                            color={color}
                            size={size}
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
                            size={size}
                        />
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
        </Tabs>
    );
}

export default function TabsLayout() {
    return (
        <TabBarVisibilityProvider>
            <TabsLayoutInner />
        </TabBarVisibilityProvider>
    );
}
