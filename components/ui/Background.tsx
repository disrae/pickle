import React from 'react';
import { View } from 'react-native';

// Pickleball hole pattern component
function PickleballHoles() {
    const holes = [];
    const holeSize = 40;
    const spacing = 70;

    // Create diagonal pattern of holes - extended for wider screens
    for (let row = -2; row < 25; row++) {
        for (let col = -2; col < 30; col++) {
            const x = col * spacing + (row % 2) * (spacing / 2);
            const y = row * spacing;

            holes.push(
                <View
                    key={`hole-${row}-${col}`}
                    className="bg-lime-500/60 rounded-full absolute"
                    style={{
                        width: holeSize,
                        height: holeSize,
                        left: x,
                        top: y,
                    }}
                />
            );
        }
    }

    return <>{holes}</>;
}

export function Background({ children }: { children: React.ReactNode; }) {
    return (
        <View className="flex-1 bg-lime-400">
            {/* Pickleball hole pattern */}
            <View className="absolute inset-0 overflow-hidden">
                <PickleballHoles />
            </View>

            {/* Content rendered on top of the background */}
            {children}
        </View>
    );
}

export function ChatBackground({ children }: { children: React.ReactNode; }) {
    return (
        <View className="flex-1 bg-lime-500">
            {/* Content rendered on chat background */}
            {children}
        </View>
    );
}
