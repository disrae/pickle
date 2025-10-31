import React from "react";
import { Text, TextInput, View } from "react-native";

export function StyledInput({
    label,
    placeholder,
    secureTextEntry,
    value,
    onChangeText,
    keyboardType = "default"
}: {
    label: string;
    placeholder: string;
    secureTextEntry?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: "default" | "email-address";
}) {
    return (
        <View className="w-full">
            <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>
            <TextInput
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                className="bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5"
                placeholderTextColor="#475569"
            />
        </View>
    );
}

