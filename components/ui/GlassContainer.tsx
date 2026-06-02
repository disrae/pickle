import { View, ViewProps } from "react-native";

interface GlassContainerProps extends ViewProps {
    children: React.ReactNode;
    /** Retained for API compatibility; ignored in the flat light system. */
    glassEffectStyle?: "clear" | "regular";
}

/**
 * Elevated surface for the light app shell.
 *
 * Depth comes from a hairline border + generous radius (flat design language),
 * with only a whisper of shadow so it reads as a distinct card on the
 * warm-paper background without looking heavy in sunlight.
 */
export function GlassContainer({
    children,
    style,
    glassEffectStyle: _glassEffectStyle,
    ...props
}: GlassContainerProps) {
    const surface = {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "rgba(18,23,15,0.08)",
        shadowColor: "#12170F",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    };

    return (
        <View style={[{ overflow: "hidden" }, surface, style]} {...props}>
            {children}
        </View>
    );
}
