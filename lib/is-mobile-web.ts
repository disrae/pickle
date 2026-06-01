import { Platform } from "react-native";

export function isMobileWeb(): boolean {
    if (Platform.OS !== "web" || typeof window === "undefined") return false;

    const ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return true;
    if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
        return true;
    }

    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}
