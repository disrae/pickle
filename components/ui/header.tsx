import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
    title: string;
    rightButton?: "chat" | "back";
    onRightPress?: () => void;
    onTitlePress?: () => void;
}

export function Header({ title, rightButton, onRightPress, onTitlePress }: HeaderProps) {
    const { top } = useSafeAreaInsets();

    const RightButton = () => {
        if (!rightButton || !onRightPress) return null;

        return (
            <TouchableOpacity
                onPress={onRightPress}
                className="p-2"
                style={{ position: "absolute", right: 16, top: top + 10 }}
            >
                <Ionicons
                    name={rightButton === "chat" ? "chatbubbles" : "arrow-back"}
                    size={28}
                    color="white"
                />
            </TouchableOpacity>
        );
    };

    const TitleContent = () => {
        if (onTitlePress) {
            return (
                <TouchableOpacity onPress={onTitlePress} className="flex-row items-center" activeOpacity={0.7}>
                    <Text className="text-4xl font-bold text-slate-200">
                        {title}
                    </Text>
                    <Ionicons name="chevron-down" size={28} color="white" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            );
        }
        return (
            <Text className="text-4xl font-bold text-slate-200">
                {title}
            </Text>
        );
    };

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
                    <TitleContent />
                    <RightButton />
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
                    <TitleContent />
                    <RightButton />
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
                    <TitleContent />
                    <RightButton />
                </BlurView>
            )}
        </>
    );
}