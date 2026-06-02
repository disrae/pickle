import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Consistent card/section eyebrow used across the app.
 *
 * One label treatment everywhere: small, uppercase, tracked, secondary ink.
 * Optional info affordance on the left and an action node on the right.
 */
export function SectionHeader({
    label,
    onInfo,
    right,
}: {
    label: string;
    onInfo?: () => void;
    right?: React.ReactNode;
}) {
    return (
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <Text className="text-foreground text-lg font-bold">
                    {label}
                </Text>
                {onInfo && (
                    <TouchableOpacity onPress={onInfo} hitSlop={10} className="ml-1.5">
                        <Ionicons name="information-circle-outline" size={16} color="#5b6650" />
                    </TouchableOpacity>
                )}
            </View>
            {right}
        </View>
    );
}
