import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Icon + label row inside the tab bar (excludes safe-area inset). */
export const TAB_BAR_CONTENT_HEIGHT = 56;
export const TAB_BAR_TOP_PADDING = 8;

/** Total bottom inset reserved for scroll content above the tab bar. */
export function useTabBarHeight() {
    const { bottom } = useSafeAreaInsets();
    if (Platform.OS === "web") {
        return 100;
    }
    return TAB_BAR_CONTENT_HEIGHT + TAB_BAR_TOP_PADDING + bottom;
}
