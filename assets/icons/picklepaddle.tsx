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
    'M12 1.8 C 8.3 1.8 5.8 4.1 5.8 7.6 C 5.8 10.7 7.7 13 10.2 13.8 C 10.7 14 11 14.5 11 15.1 L 11 20.4 a 1 1 0 0 0 2 0 L 13 15.1 C 13 14.5 13.3 14 13.8 13.8 C 16.3 13 18.2 10.7 18.2 7.6 C 18.2 4.1 15.7 1.8 12 1.8 Z';

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
                fill={filled ? tintColor : "transparent"}
                stroke={tintColor}
                strokeWidth={filled ? 0 : strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </Svg>
    );
}
