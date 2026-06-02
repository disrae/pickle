import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Tone = "brand" | "competition" | "neutral";

const TILE: Record<Tone, { bg: string; fg: string }> = {
    brand: { bg: "#E8F3DC", fg: "#2E5C16" },
    competition: { bg: "rgba(245,158,11,0.14)", fg: "#B45309" },
    neutral: { bg: "rgba(18,23,15,0.10)", fg: "#3B4332" },
};

/**
 * Consistent rounded icon tile — the single icon-in-a-tile motif used app-wide.
 */
export function IconTile({
    name,
    tone = "brand",
    size = 44,
}: {
    name: React.ComponentProps<typeof Ionicons>["name"];
    tone?: Tone;
    size?: number;
}) {
    const { bg, fg } = TILE[tone];
    return (
        <View
            style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg }}
            className="items-center justify-center"
        >
            <Ionicons name={name} size={Math.round(size * 0.5)} color={fg} />
        </View>
    );
}
