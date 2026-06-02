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
    // One consistent card surface across the whole app. Callers may still
    // override radius/padding via `style`, but the defaults keep things unified.
    const surface = {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(18,23,15,0.14)",
        shadowColor: "#12170F",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
    };

    return (
        <View style={[{ overflow: "hidden" }, surface, style]} {...props}>
            {children}
        </View>
    );
}
