import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * App-wide backdrop: a rich green-black gradient with two soft Volt glows.
 *
 * The glows are drawn as SVG radial gradients (not solid circles) so they
 * fade smoothly to transparent with no hard edges. Coordinates are in real
 * pixels (userSpaceOnUse) so placement is predictable on any screen size,
 * and identical across iOS, Android, and web.
 */
export function Background({ children }: { children: React.ReactNode; }) {
    const { width, height } = useWindowDimensions();
    const radius = Math.max(width, height) * 0.55;

    return (
        <View className="flex-1 bg-[#0b0e09]">
            <LinearGradient
                colors={["#16210d", "#0d1209", "#080a06"]}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
            />
            <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                    <RadialGradient
                        id="glowTopRight"
                        cx={width * 0.86}
                        cy={height * 0.05}
                        r={radius}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#a3e635" stopOpacity={0.34} />
                        <Stop offset="45%" stopColor="#84cc16" stopOpacity={0.12} />
                        <Stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                    </RadialGradient>
                    <RadialGradient
                        id="glowLeft"
                        cx={width * 0.08}
                        cy={height * 0.5}
                        r={radius}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#65a30d" stopOpacity={0.30} />
                        <Stop offset="50%" stopColor="#3f6212" stopOpacity={0.12} />
                        <Stop offset="100%" stopColor="#3f6212" stopOpacity={0} />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={width} height={height} fill="url(#glowTopRight)" />
                <Rect x="0" y="0" width={width} height={height} fill="url(#glowLeft)" />
            </Svg>
            {children}
        </View>
    );
}

export function ChatBackground({ children }: { children: React.ReactNode; }) {
    const { width, height } = useWindowDimensions();

    return (
        <View className="flex-1 bg-[#0b0e09]">
            <LinearGradient
                colors={["#11180b", "#0b0e09"]}
                style={StyleSheet.absoluteFill}
            />
            <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                    <RadialGradient
                        id="chatGlow"
                        cx={width * 0.9}
                        cy={height * 0.04}
                        r={Math.max(width, height) * 0.5}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#84cc16" stopOpacity={0.18} />
                        <Stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={width} height={height} fill="url(#chatGlow)" />
            </Svg>
            {children}
        </View>
    );
}
