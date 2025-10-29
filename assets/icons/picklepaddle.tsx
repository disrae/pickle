import { Image, ImageStyle } from 'expo-image';
import React from 'react';
import { StyleProp } from 'react-native';

interface PicklePaddleProps {
    width?: number;
    height?: number;
    style?: StyleProp<ImageStyle>;
    tintColor?: string;
}

export function PicklePaddle({ width = 24, height = 24, style, tintColor }: PicklePaddleProps) {
    return (
        <Image
            source={require('../images/picklepaddle.png')}
            style={[{ width, height, tintColor }, style]}
            contentFit="contain"
        />
    );
}

