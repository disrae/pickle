import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * App-wide backdrop (light theme): a clean warm-paper surface with a single,
 * very soft brand-green wash in the top corner for warmth.
 *
 * Depth in the app comes from hairline borders + spacing, not from this
 * backdrop — keep the wash subtle so content stays crisp in sunlight.
 */
export function Background({ children }: { children: React.ReactNode; }) {
    const { width, height } = useWindowDimensions();
    const radius = Math.max(width, height) * 0.55;

    return (
        <View className="flex-1 bg-background">
            <LinearGradient
                colors={["#FFFFFF", "#FAFAF7"]}
                locations={[0, 1]}
                style={StyleSheet.absoluteFill}
            />
            <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                    <RadialGradient
                        id="brandWash"
                        cx={width * 0.88}
                        cy={height * 0.04}
                        r={radius}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#3F7D20" stopOpacity={0.08} />
                        <Stop offset="55%" stopColor="#3F7D20" stopOpacity={0.03} />
                        <Stop offset="100%" stopColor="#3F7D20" stopOpacity={0} />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={width} height={height} fill="url(#brandWash)" />
            </Svg>
            {children}
        </View>
    );
}

export function ChatBackground({ children }: { children: React.ReactNode; }) {
    return (
        <View className="flex-1 bg-background">
            <LinearGradient
                colors={["#FFFFFF", "#FAFAF7"]}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
}
