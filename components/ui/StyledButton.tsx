import React from "react";
import { Text, TouchableOpacity } from "react-native";

export function StyledButton({
    onPress,
    title,
    variant = "primary",
    fullWidth = true,
    className = ""
}: {
    onPress: () => void;
    title: string;
    variant?: "primary" | "secondary" | "destructive";
    fullWidth?: boolean;
    className?: string;
}) {
    let colorClass = "";
    let textColor = "text-white";

    switch (variant) {
        case "primary":
            colorClass = "bg-slate-600 active:bg-slate-700";
            break;
        case "secondary":
            colorClass = "bg-slate-200 active:bg-slate-300";
            textColor = "text-slate-800";
            break;
        case "destructive":
            colorClass = "bg-red-600 active:bg-red-700";
            break;
    }

    const buttonClass = `rounded-xl py-4 ${fullWidth ? "w-full" : ""} ${colorClass} ${className}`;

    return (
        <TouchableOpacity
            onPress={onPress}
            className={buttonClass}
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <Text className={`${textColor} text-center text-base font-bold`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

