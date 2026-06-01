import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Title row height (text-2xl + icon touch targets). */
const HEADER_ROW_HEIGHT = 52;

/** Android edge-to-edge often under-reports top inset vs visual status bar overlap. */
const ANDROID_TOP_EXTRA = 12;

export function getHeaderPaddingTop(top: number): number {
    if (Platform.OS === "web") return 16;
    if (Platform.OS === "android") return top + ANDROID_TOP_EXTRA;
    return top - 8;
}

export function getHeaderPaddingBottom(): number {
    if (Platform.OS === "android") return 14;
    if (Platform.OS === "ios") return 16;
    return 10;
}

/** Scroll padding to clear the absolute `Header` (matches Header styles). */
export function useHeaderHeight(): number {
    const { top } = useSafeAreaInsets();
    return getHeaderPaddingTop(top) + HEADER_ROW_HEIGHT + getHeaderPaddingBottom();
}
