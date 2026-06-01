import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Variant = "brand" | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";

const containerByVariant: Record<Variant, string> = {
    brand: "bg-brand active:bg-brand-strong",
    primary: "bg-primary active:opacity-90",
    secondary: "bg-secondary border border-border active:opacity-80",
    outline: "border border-border active:bg-surface-2",
    ghost: "active:bg-surface-2",
    destructive: "bg-destructive active:opacity-90",
    success: "bg-success active:opacity-90",
};

const textByVariant: Record<Variant, string> = {
    brand: "text-brand-foreground",
    primary: "text-primary-foreground",
    secondary: "text-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    destructive: "text-destructive-foreground",
    success: "text-success-foreground",
};

const spinnerByVariant: Record<Variant, string> = {
    brand: "#151c0c",
    primary: "#fafaf7",
    secondary: "#12170f",
    outline: "#12170f",
    ghost: "#12170f",
    destructive: "#fafafa",
    success: "#fafafa",
};

export function StyledButton({
    onPress,
    title,
    variant = "brand",
    fullWidth = true,
    className = "",
    disabled = false,
    loading = false,
}: {
    onPress: () => void;
    title: string;
    variant?: Variant;
    fullWidth?: boolean;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={isDisabled ? undefined : onPress}
            disabled={isDisabled}
            className={`h-14 flex-row items-center justify-center rounded-2xl px-5 ${fullWidth ? "w-full" : ""} ${containerByVariant[variant]} ${isDisabled ? "opacity-50" : ""} ${className}`}
        >
            {loading ? (
                <ActivityIndicator color={spinnerByVariant[variant]} />
            ) : (
                <View className="flex-row items-center justify-center gap-2">
                    <Text className={`text-center text-base font-bold ${textByVariant[variant]}`}>
                        {title}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}
