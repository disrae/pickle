import { Ionicons } from "@expo/vector-icons";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassContainer } from "./GlassContainer";
import { GuestModeBanner } from "./GuestModeBanner";

interface HeaderProps {
    title: string;
    titleSize?: "text-2xl" | "text-3xl" | "text-4xl";
    rightButton?: "chat" | "back";
    onRightPress?: () => void;
    onTitlePress?: () => void;
    user?: any; // User object from Convex query
}

export function Header({ title, titleSize = "text-2xl", rightButton, onRightPress, onTitlePress, user }: HeaderProps) {
    const { top } = useSafeAreaInsets();
    const isGuestMode = user === null;
    const bannerHeight = isGuestMode
        ? top + (Platform.OS === "web" ? 52 : 0)
        : 0;

    const RightButton = () => {
        if (!rightButton || !onRightPress) return null;

        return (
            <TouchableOpacity
                onPress={onRightPress}
                className="p-2"
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
        <>
            <GuestModeBanner isVisible={isGuestMode} />
            <GlassContainer
                glassEffectStyle="clear"
                style={{
                    position: 'absolute',
                    top: bannerHeight,
                    left: 0,
                    right: 0,
                    paddingTop: Platform.OS === "web" ? 16 : top - 8,
                    paddingBottom: 10,
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
                    <TitleContent />
                    <RightButton />
                </View>
            </GlassContainer>
        </>
    );
}