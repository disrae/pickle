import React from "react";
import { PicklePaddle } from "@/assets/icons/picklepaddle";

interface CourtTabIconProps {
    focused: boolean;
    color?: string;
    size?: number;
}

/**
 * Court tab icon — a clean pickleball-paddle silhouette.
 * Solid when active, outlined when inactive. Uses SVG so it tints
 * reliably across iOS, Android, and web.
 */
export function CourtTabIcon({ focused, color = "#8a9482", size = 26 }: CourtTabIconProps) {
    return (
        <PicklePaddle
            width={size}
            height={size}
            tintColor={color}
            filled={focused}
            strokeWidth={2}
        />
    );
}
