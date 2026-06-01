import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Icon + label row inside the tab bar (excludes safe-area inset). */
export const TAB_BAR_CONTENT_HEIGHT = 56;
export const TAB_BAR_TOP_PADDING = 8;

/** Bottom clearance for the floating web tab pill (bottom offset + bar height). */
export const WEB_TAB_BAR_CLEARANCE = 88;

/** Total bottom inset reserved for scroll content above the tab bar. */
export function useTabBarHeight() {
    const { bottom } = useSafeAreaInsets();
    if (Platform.OS === "web") {
        return WEB_TAB_BAR_CLEARANCE;
    }
    return TAB_BAR_CONTENT_HEIGHT + TAB_BAR_TOP_PADDING + bottom;
}

/**
 * Padding below a bottom composer (chat input, etc.).
 * Native tab screens already end above the tab bar — don't double-count.
 */
/** Composer on a tab screen (tab bar already reserves bottom space). */
export function useComposerBottomInset() {
    if (Platform.OS === "web") {
        return WEB_TAB_BAR_CLEARANCE;
    }
    return 12;
}

/** Composer on a full-screen chat (no tab bar — honor home indicator). */
export function useChatComposerBottomInset() {
    const { bottom } = useSafeAreaInsets();
    if (Platform.OS === "web") {
        return WEB_TAB_BAR_CLEARANCE;
    }
    return Math.max(bottom, 12);
}

/** Extra lift on iOS — liquid-glass tab bar sits above layout insets. */
const IOS_COACH_CHAT_TAB_EXTRA = 16;

/** Coach chat with tab bar still visible (iOS native tabs overlay the screen). */
export function useCoachChatComposerBottomInset() {
    const tabBarHeight = useTabBarHeight();
    const chatInset = useChatComposerBottomInset();
    if (Platform.OS === "ios") {
        return tabBarHeight + IOS_COACH_CHAT_TAB_EXTRA;
    }
    return chatInset;
}
