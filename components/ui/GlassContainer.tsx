import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { View, ViewProps } from "react-native";

interface GlassContainerProps extends ViewProps {
    children: React.ReactNode;
}

export function GlassContainer({ children, style, ...props }: GlassContainerProps) {
    if (isLiquidGlassAvailable()) {
        return (
            <GlassView
                glassEffectStyle="clear"
                style={[
                    {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    },
                    style,
                ]}
                {...props}
            >
                {children}
            </GlassView>
        );
    }

    // For iOS 18, Android, and web: use plain View with bg-black/60
    return (
        <View
            style={[
                {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
}

