import { Image, ImageStyle } from 'expo-image';
import React from 'react';
import { StyleProp } from 'react-native';

interface PickleballProps {
    width?: number;
    height?: number;
    style?: StyleProp<ImageStyle>;
}

export function Pickleball({ width = 80, height = 80, style }: PickleballProps) {
    return (
        <Image
            source={require('../images/pickleball.png')}
            style={[{ width, height }, style]}
            contentFit="contain"
        />
    );
}