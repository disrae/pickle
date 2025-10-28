import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface PickleballLoadingProps {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
    duration?: number;
    minScale?: number;
    maxScale?: number;
}

export function PickleballLoading({
    width = 60,
    height = 60,
    style,
    duration = 2000,
    minScale = 0.9,
    maxScale = 1.1,
}: PickleballLoadingProps) {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(minScale);

    useEffect(() => {
        // Spinning animation
        rotation.value = withRepeat(
            withTiming(360, {
                duration,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Realistic bouncing animation (viewed from above)
        // Ball falls away fast (accelerating), comes back quickly without hanging
        scale.value = maxScale; // Start at the top
        scale.value = withRepeat(
            withSequence(
                // Falling away - accelerates (gets faster as it falls)
                withTiming(minScale, {
                    duration: duration * 0.45, // Fast fall
                    easing: Easing.in(Easing.quad), // Strong acceleration
                }),
                // Coming back up - quick rise, minimal hang time at peak
                withTiming(maxScale, {
                    duration: duration * 0.55, // Quick rise
                    easing: Easing.out(Easing.ease), // Minimal deceleration - snaps through peak
                })
            ),
            -1,
            false
        );
    }, [duration, minScale, maxScale, rotation, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: scale.value }
            ],
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

