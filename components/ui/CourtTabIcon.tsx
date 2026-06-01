import { MinimalPaddleTabIcon } from "@/components/ui/MinimalPaddleTabIcon";

interface CourtTabIconProps {
    focused: boolean;
    color?: string;
    size?: number;
}

const BRAND_VOLT = "#a3e635";

export function CourtTabIcon({ focused, color = "#8a9482", size = 26 }: CourtTabIconProps) {
    return (
        <MinimalPaddleTabIcon
            size={size}
            color={focused ? BRAND_VOLT : color}
            filled={focused}
        />
    );
}
