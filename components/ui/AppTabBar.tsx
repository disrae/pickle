import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getMainTabEntries } from "@/lib/main-tab-routes";
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_TOP_PADDING } from "@/lib/tab-bar-layout";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = "#a3e635";
const INACTIVE = "#8a9482";

/**
 * Bottom tab bar for Android (and iOS when NativeTabs / liquid glass unavailable).
 * Handles safe-area insets — the default Tabs bar used a fixed 88px height and
 * fought the system nav gesture area on Android.
 */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { bottom } = useSafeAreaInsets();

    return (
        <View
            style={{
                backgroundColor: "#0c100a",
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.08)",
                paddingTop: TAB_BAR_TOP_PADDING,
                paddingBottom: bottom,
                ...(Platform.OS === "android" ? { elevation: 12 } : {}),
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: TAB_BAR_CONTENT_HEIGHT,
                }}
            >
                {getMainTabEntries(state, descriptors).map(({ route, routeIndex, options }) => {
                    const label =
                        typeof options.tabBarLabel === "string"
                            ? options.tabBarLabel
                            : typeof options.title === "string"
                              ? options.title
                              : route.name;

                    const isFocused = state.index === routeIndex;
                    const color = isFocused ? ACTIVE : INACTIVE;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            android_ripple={{ color: "rgba(163,230,53,0.12)", borderless: true }}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: TAB_BAR_CONTENT_HEIGHT,
                                gap: 2,
                            }}
                        >
                            <View style={{ height: 26, alignItems: "center", justifyContent: "center" }}>
                                {options.tabBarIcon?.({ focused: isFocused, color, size: 26 })}
                            </View>
                            <Text
                                style={{
                                    color,
                                    fontSize: 11,
                                    fontWeight: "600",
                                    letterSpacing: 0.2,
                                }}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
