import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    const { top } = useSafeAreaInsets();

    return (
        <>
            {isLiquidGlassAvailable() ? (
                <GlassView
                    glassEffectStyle="clear"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        paddingTop: top + 10,
                        paddingBottom: 20,
                        paddingHorizontal: 16,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Text className="text-4xl font-bold text-slate-200">
                        {title}
                    </Text>
                </GlassView>
            ) : Platform.OS === 'android' ? (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        paddingTop: top + 20,
                        paddingBottom: 20,
                        paddingHorizontal: 16,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Text className="text-4xl font-bold text-slate-200">
                        {title}
                    </Text>
                </View>
            ) : (
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        paddingTop: top + 20,
                        paddingBottom: 20,
                        paddingHorizontal: 16,
                    }}
                >
                    <Text className="text-4xl font-bold text-slate-200">
                        {title}
                    </Text>
                </BlurView>
            )}
        </>
    );
}