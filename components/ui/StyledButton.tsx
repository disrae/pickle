import React from "react";
import { Text, TouchableOpacity } from "react-native";

export function StyledButton({ onPress, title }: { onPress: () => void; title: string; }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-lime-500 rounded-xl py-4 w-full active:bg-lime-600"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <Text className="text-white text-center text-base font-bold">
                {title}
            </Text>
        </TouchableOpacity>
    );
}

