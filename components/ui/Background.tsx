import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

/**
 * App-wide backdrop: a rich green-black gradient with two soft Volt glows.
 * Replaces the old lime "pickleball holes" pattern. Designed for light text.
 */
export function Background({ children }: { children: React.ReactNode; }) {
    return (
        <View className="flex-1 bg-[#0b0e09]">
            <LinearGradient
                colors={["#16210d", "#0d1209", "#080a06"]}
                locations={[0, 0.45, 1]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {/* Soft brand glows */}
            <View
                pointerEvents="none"
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#84cc16]"
                style={{ opacity: 0.16 }}
            />
            <View
                pointerEvents="none"
                className="absolute -left-28 top-1/3 h-72 w-72 rounded-full bg-[#3f6212]"
                style={{ opacity: 0.18 }}
            />
            {children}
        </View>
    );
}

export function ChatBackground({ children }: { children: React.ReactNode; }) {
    return (
        <View className="flex-1 bg-[#0b0e09]">
            <LinearGradient
                colors={["#11180b", "#0b0e09"]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {children}
        </View>
    );
}
