import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getMainTabEntries } from "@/lib/main-tab-routes";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

const ACTIVE = "#a3e635"; // Volt
const INACTIVE = "#8a9482";
const INACTIVE_HOVER = "#c4cdb8";

/**
 * Floating, centered "pill" tab bar used on web only.
 *
 * A full-width bottom bar reads as a cheap mobile port on desktop, so on web
 * we render a compact, elevated capsule centered at the bottom of the viewport.
 * Native platforms keep the standard react-navigation bar.
 */
export function WebTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View
            style={{
                position: "fixed" as "absolute",
                left: 0,
                right: 0,
                bottom: 18,
                alignItems: "center",
                zIndex: 50,
                pointerEvents: "box-none",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: "rgba(16,20,12,0.92)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
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

                    return (
                        <TabPill
                            key={route.key}
                            label={label}
                            isFocused={isFocused}
                            renderIcon={options.tabBarIcon}
                            onPress={onPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

function TabPill({
    label,
    isFocused,
    renderIcon,
    onPress,
}: {
    label: string;
    isFocused: boolean;
    renderIcon: BottomTabBarProps["descriptors"][string]["options"]["tabBarIcon"];
    onPress: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    const color = isFocused ? ACTIVE : hovered ? INACTIVE_HOVER : INACTIVE;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                height: 44,
                paddingHorizontal: isFocused ? 16 : 14,
                borderRadius: 999,
                backgroundColor: isFocused
                    ? "rgba(163,230,53,0.14)"
                    : hovered
                      ? "rgba(255,255,255,0.06)"
                      : "transparent",
                ...(Platform.OS === "web" ? { transitionDuration: "150ms", cursor: "pointer" } : {}),
            }}
        >
            <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
                {renderIcon?.({ focused: isFocused, color, size: 22 })}
            </View>
            {isFocused ? (
                <Text style={{ color, fontSize: 13, fontWeight: "700", letterSpacing: 0.2 }}>{label}</Text>
            ) : null}
        </Pressable>
    );
}
