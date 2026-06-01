import { getHeaderPaddingBottom, getHeaderPaddingTop } from "@/lib/header-layout";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassContainer } from "./GlassContainer";

interface HeaderProps {
    title: string;
    titleSize?: "text-2xl" | "text-3xl" | "text-4xl";
    leftButton?: "back";
    onLeftPress?: () => void;
    rightButton?: "chat" | "back";
    onRightPress?: () => void;
    onTitlePress?: () => void;
}

export function Header({
    title,
    titleSize = "text-2xl",
    leftButton,
    onLeftPress,
    rightButton,
    onRightPress,
    onTitlePress,
}: HeaderProps) {
    const { top } = useSafeAreaInsets();

    const LeftButton = () => {
        if (leftButton !== "back" || !onLeftPress) return null;

        return (
            <TouchableOpacity onPress={onLeftPress} className="p-2 -ml-2 mr-1">
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
        );
    };

    const RightButton = () => {
        if (!rightButton || !onRightPress) return null;

        return (
            <TouchableOpacity onPress={onRightPress} className="p-2">
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
                    <Text className={`${titleSize} font-bold text-slate-200`}>
                        {title}
                    </Text>
                    <Ionicons name="chevron-down" size={28} color="white" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            );
        }
        return (
            <Text className={`${titleSize} font-bold text-slate-200`}>
                {title}
            </Text>
        );
    };

    return (
        <GlassContainer
            glassEffectStyle="clear"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: getHeaderPaddingTop(top),
                paddingBottom: getHeaderPaddingBottom(),
                paddingHorizontal: 16,
                backgroundColor: "rgba(8, 12, 7, 0.95)",
                borderWidth: 0,
                borderColor: "transparent",
                borderBottomWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.28,
                shadowRadius: 14,
                elevation: 8,
            }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 min-w-0">
                    <LeftButton />
                    <TitleContent />
                </View>
                <RightButton />
            </View>
        </GlassContainer>
    );
}
