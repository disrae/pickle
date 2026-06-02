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
                <Ionicons name="arrow-back" size={28} color="#12170f" />
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
                    color="#12170f"
                />
            </TouchableOpacity>
        );
    };

    const TitleContent = () => {
        if (onTitlePress) {
            return (
                <TouchableOpacity onPress={onTitlePress} className="flex-row items-center" activeOpacity={0.7}>
                    <Text className={`${titleSize} font-display text-foreground`}>
                        {title}
                    </Text>
                    <Ionicons name="chevron-down" size={28} color="#12170f" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            );
        }
        return (
            <Text className={`${titleSize} font-display text-foreground`}>
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
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderWidth: 0,
                borderColor: "transparent",
                borderBottomWidth: 1,
                borderBottomColor: "rgba(18,23,15,0.08)",
                shadowColor: "#12170F",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 14,
                elevation: 4,
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
