import { PickleballLoading } from '@/assets/icons/pickleball-loading';
import { useLoading } from '@/lib/loading-context';
import React from 'react';
import { View } from 'react-native';
import { Background } from '../ui/Background';

export function LoadingScreen() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <View className="absolute inset-0 z-50 flex-1 bg-background">
            <Background>
                <View className="flex-1 items-center justify-center px-6">
                    <PickleballLoading minScale={0.94} maxScale={1.06} duration={1800} />
                </View>
            </Background>
        </View>
    );
}
