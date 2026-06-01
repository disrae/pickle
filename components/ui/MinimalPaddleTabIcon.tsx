import Svg, { Line, Path } from "react-native-svg";

/** Simplified minimal paddle (inspired by 02-minimal-paddle-tab). */
const PADDLE_BODY =
    "M9 2.5h6c2.2 0 4 1.8 4 4v7c0 2.2-1.8 4-4 4h-2.5v5.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V17.5H9c-2.2 0-4-1.8-4-4v-7c0-2.2 1.8-4 4-4z";

interface MinimalPaddleTabIconProps {
    size: number;
    color: string;
    filled: boolean;
}

/**
 * Tab-sized paddle icon — vector only so it tints on web + Android (no JPG box).
 */
export function MinimalPaddleTabIcon({ size, color, filled }: MinimalPaddleTabIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d={PADDLE_BODY}
                fill={filled ? color : "transparent"}
                stroke={color}
                strokeWidth={filled ? 0 : 1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {!filled ? (
                <>
                    <Line x1="7.5" y1="7.5" x2="16.5" y2="12.5" stroke={color} strokeWidth={1} />
                    <Line x1="8.5" y1="9.5" x2="15.5" y2="13.5" stroke={color} strokeWidth={1} />
                    <Line x1="11" y1="18" x2="11" y2="22" stroke={color} strokeWidth={1} />
                    <Line x1="13" y1="18" x2="13" y2="22" stroke={color} strokeWidth={1} />
                </>
            ) : null}
        </Svg>
    );
}
