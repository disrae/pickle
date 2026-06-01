import { useTheme } from "@/lib/theme-context";
import React, { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

const DARK = {
    text: "#f4f7f0",
    placeholder: "#9aa68c",
    fieldBg: "rgba(255,255,255,0.06)",
    fieldBgFocused: "rgba(163,230,53,0.1)",
    border: "rgba(255,255,255,0.16)",
    borderFocused: "#a3e635",
} as const;

const LIGHT = {
    text: "#12170f",
    placeholder: "#6b7560",
    fieldBg: "#ffffff",
    fieldBgFocused: "#ffffff",
    border: "#e2e4db",
    borderFocused: "#84cc16",
} as const;

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

    const palette = theme === "dark" ? DARK : LIGHT;

    return (
        <View className="w-full">
            {label ? (
                <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
            ) : null}
            <View
                className="flex-row items-center rounded-2xl px-4"
                style={{
                    backgroundColor: focused ? palette.fieldBgFocused : palette.fieldBg,
                    borderColor: focused ? palette.borderFocused : palette.border,
                    borderWidth: 1,
                    borderCurve: "continuous",
                }}
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
                    placeholderTextColor={palette.placeholder}
                    underlineColorAndroid="transparent"
                    className="flex-1 py-4 text-base"
                    style={{
                        color: palette.text,
                        backgroundColor: "transparent",
                        ...(Platform.OS === "android" ? { paddingVertical: 12 } : {}),
                    }}
                />
                {secureTextEntry ? (
                    <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} className="pl-3">
                        <Text className="text-sm font-semibold text-muted-foreground">
                            {hidden ? "Show" : "Hide"}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
