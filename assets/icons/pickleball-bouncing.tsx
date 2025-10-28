import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface PickleballBouncingProps {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
    bounceHeight?: number;
    duration?: number;
}

export function PickleballBouncing({
    width = 80,
    height = 80,
    style,
    bounceHeight = 8,
    duration = 1000,
}: PickleballBouncingProps) {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(-bounceHeight, {
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [bounceHeight, duration]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[animatedStyle, style]}>
            <Image
                source={require('../images/pickleball.png')}
                style={{ width, height }}
                contentFit="contain"
            />
        </Animated.View>
    );
}

