import { MinimalPaddleTabIcon } from "@/components/ui/MinimalPaddleTabIcon";

interface CourtTabIconProps {
    focused: boolean;
    color?: string;
    size?: number;
}

const BRAND_GREEN = "#3F7D20";

export function CourtTabIcon({ focused, color = "#5c6454", size = 26 }: CourtTabIconProps) {
    return (
        <MinimalPaddleTabIcon
            size={size}
            color={focused ? BRAND_GREEN : color}
            filled={focused}
        />
    );
}
