import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, ViewProps } from "react-native";

interface GlassContainerProps extends ViewProps {
    children: React.ReactNode;
    glassEffectStyle?: "clear" | "regular";
}

/**
 * Elevated "glass" surface for the dark app shell.
 * A subtle translucent-white panel with a hairline border + soft shadow,
 * giving crisp separation from the dark backdrop (replaces the old muddy
 * black-on-lime overlay).
 */
export function GlassContainer({
    children,
    style,
    glassEffectStyle = "regular",
    ...props
}: GlassContainerProps) {
    const overlayBg =
        glassEffectStyle === "regular" ? "rgba(10,13,8,0.82)" : "rgba(10,13,8,0.68)";
    const border = {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    };
    const shadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
        elevation: 6,
    };

    // Native gets a real blur with a dark tint overlay behind content.
    if (Platform.OS !== "web") {
        return (
            <BlurView
                intensity={28}
                tint="dark"
                style={[{ overflow: "hidden" }, border, shadow, style]}
                {...props}
            >
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayBg }]} />
                {children}
            </BlurView>
        );
    }

    return (
        <View
            style={[{ backgroundColor: "rgba(16,21,12,0.94)" }, border, shadow, style]}
            {...props}
        >
            {children}
        </View>
    );
}
