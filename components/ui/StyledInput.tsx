import { useTheme } from "@/lib/theme-context";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export function StyledInput({
    label,
    placeholder,
    secureTextEntry,
    value,
    onChangeText,
    keyboardType = "default",
    autoComplete,
    textContentType,
    autoFocus,
}: {
    label?: string;
    placeholder: string;
    secureTextEntry?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: "default" | "email-address";
    autoComplete?: "email" | "password" | "username" | "name" | "off";
    textContentType?: "emailAddress" | "password" | "username" | "name";
    autoFocus?: boolean;
}) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(!!secureTextEntry);

    const placeholderColor = theme === "dark" ? "#7c8a6f" : "#8a917e";

    return (
        <View className="w-full">
            {label ? (
                <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
            ) : null}
            <View
                className={`flex-row items-center rounded-2xl border bg-surface px-4 ${focused ? "border-brand" : "border-border"}`}
            >
                <TextInput
                    placeholder={placeholder}
                    secureTextEntry={hidden}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoComplete={autoComplete}
                    textContentType={textContentType}
                    autoFocus={autoFocus}
                    autoCapitalize="none"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="flex-1 py-4 text-base text-foreground"
                    placeholderTextColor={placeholderColor}
                />
                {secureTextEntry ? (
                    <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} className="pl-3">
                        <Text className="text-sm font-semibold text-foreground-muted">
                            {hidden ? "Show" : "Hide"}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
