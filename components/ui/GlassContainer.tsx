import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { View, ViewProps } from "react-native";

interface GlassContainerProps extends ViewProps {
    children: React.ReactNode;
    glassEffectStyle?: "clear" | "regular";
}

export function GlassContainer({ children, style, glassEffectStyle = "clear", ...props }: GlassContainerProps) {
    const backgroundOpacity = glassEffectStyle === "regular" ? 0.8 : 0.6;

    if (isLiquidGlassAvailable()) {
        return (
            <GlassView
                glassEffectStyle={glassEffectStyle}
                style={[
                    {
                        backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
                    },
                    style,
                ]}
                {...props}
            >
                {children}
            </GlassView>
        );
    }

    // For iOS 18, Android, and web: use plain View with appropriate background opacity
    return (
        <View
            style={[
                {
                    backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
}

