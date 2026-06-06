import { useTheme } from "@/lib/theme-context";
import { Host, TextInput, useNativeState } from "@expo/ui";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

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
    fieldBgFocused: "#e8f3dc",
    border: "#e2e4db",
    borderFocused: "#3f7d20",
} as const;

function focusRing(color: string) {
    return Platform.OS === "web"
        ? ({ boxShadow: `0 0 0 3px ${color}` } as const)
        : {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45,
              shadowRadius: 6,
          };
}

function resolveAutoComplete(
    autoComplete?: "email" | "password" | "username" | "name" | "off",
    textContentType?: "emailAddress" | "password" | "username" | "name"
) {
    if (autoComplete) return autoComplete;
    switch (textContentType) {
        case "emailAddress":
            return "email";
        case "password":
            return "password";
        case "username":
            return "username";
        case "name":
            return "name";
        default:
            return undefined;
    }
}

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
    large,
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
    large?: boolean;
}) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(!!secureTextEntry);
    const text = useNativeState(value ?? "");

    const palette = theme === "dark" ? DARK : LIGHT;

    useEffect(() => {
        if (value !== undefined && value !== text.value) {
            text.value = value;
        }
    }, [value, text]);

    const handleChangeText = useCallback(
        (newText: string) => {
            text.value = newText;
            onChangeText?.(newText);
        },
        [text, onChangeText]
    );

    return (
        <View className="w-full">
            {label ? (
                <Text
                    className={`mb-2 font-semibold text-foreground ${large ? "text-base" : "text-sm"}`}
                >
                    {label}
                </Text>
            ) : null}
            <View
                className="flex-row items-center rounded-2xl px-4"
                style={{
                    backgroundColor: focused ? palette.fieldBgFocused : palette.fieldBg,
                    borderColor: focused ? palette.borderFocused : palette.border,
                    borderWidth: 1,
                    borderCurve: "continuous",
                    ...(focused && Platform.OS === "web"
                        ? focusRing(
                              theme === "dark"
                                  ? "rgba(163,230,53,0.22)"
                                  : "rgba(63,125,32,0.22)"
                          )
                        : {}),
                }}
            >
                <Host style={{ flex: 1 }} matchContents={{ vertical: true }}>
                    <TextInput
                        value={text}
                        placeholder={placeholder}
                        secureTextEntry={hidden}
                        onChangeText={handleChangeText}
                        keyboardType={keyboardType}
                        autoComplete={resolveAutoComplete(autoComplete, textContentType)}
                        autoFocus={autoFocus}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholderTextColor={palette.placeholder}
                        style={{
                            backgroundColor: "transparent",
                            paddingVertical: large ? 12 : Platform.OS === "android" ? 12 : 16,
                        }}
                        textStyle={{
                            color: palette.text,
                            fontSize: large ? 18 : 16,
                        }}
                    />
                </Host>
                {secureTextEntry ? (
                    <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} className="pl-3">
                        <Text
                            className={`font-semibold text-muted-foreground ${large ? "text-base" : "text-sm"}`}
                        >
                            {hidden ? "Show" : "Hide"}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
