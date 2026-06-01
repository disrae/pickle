import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PicklePaddleProps {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
    tintColor?: string;
    /** Solid silhouette (default) vs. outline stroke. */
    filled?: boolean;
    strokeWidth?: number;
}

const PADDLE_PATH =
    'M12 1.5 C 7 1.5 4 4.6 4 9 C 4 12.3 6.1 14.6 9 15.3 L 9 19.8 a 3 3 0 0 0 6 0 L 15 15.3 C 17.9 14.6 20 12.3 20 9 C 20 4.6 17 1.5 12 1.5 Z';

export function PicklePaddle({
    width = 24,
    height = 24,
    style,
    tintColor = '#000',
    filled = true,
    strokeWidth = 1.8,
}: PicklePaddleProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
            <Path
                d={PADDLE_PATH}
                fill={filled ? tintColor : 'none'}
                stroke={filled ? 'none' : tintColor}
                strokeWidth={filled ? 0 : strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </Svg>
    );
}
