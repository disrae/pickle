import { Image } from "expo-image";
import React from "react";

const ACTIVE = require("@/assets/icons/tab/court-active.webp");
const INACTIVE = require("@/assets/icons/tab/court-inactive.webp");

interface CourtTabIconProps {
    focused: boolean;
    size?: number;
}

export function CourtTabIcon({ focused, size = 26 }: CourtTabIconProps) {
    return (
        <Image
            source={focused ? ACTIVE : INACTIVE}
            style={{ width: size, height: size }}
            contentFit="contain"
            transition={120}
        />
    );
}
