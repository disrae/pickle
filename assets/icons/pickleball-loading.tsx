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
    duration = 2200,
    minScale = 0.94,
    maxScale = 1.06,
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

        // Subtle pulse: less playful bounce, more premium idle motion.
        scale.value = maxScale; // Start at the top
        scale.value = withRepeat(
            withSequence(
                withTiming(minScale, {
                    duration: duration * 0.5,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(maxScale, {
                    duration: duration * 0.5,
                    easing: Easing.inOut(Easing.quad),
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

