import { GlassContainer } from "@/components/ui/GlassContainer";
import { Text, View } from "react-native";

export function CoachNote({ children }: { children: string }) {
    return (
        <View className="mb-4 self-start max-w-[95%]">
            <GlassContainer style={{ borderRadius: 20, padding: 14 }}>
                <Text className="text-muted-foreground text-xs font-semibold mb-1">Coach</Text>
                <Text className="text-foreground leading-5">{children}</Text>
            </GlassContainer>
        </View>
    );
}
