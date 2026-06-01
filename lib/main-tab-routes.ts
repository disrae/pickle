import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

/** Visible bottom tabs in display order. */
export const MAIN_TAB_ORDER = ["court", "coach", "compete", "profile"] as const;

export type MainTabRoute = (typeof MAIN_TAB_ORDER)[number];

export type TabBarEntry = {
    route: BottomTabBarProps["state"]["routes"][number];
    routeIndex: number;
    options: BottomTabBarProps["descriptors"][string]["options"];
};

function isTabHidden(
    options: BottomTabBarProps["descriptors"][string]["options"]
): boolean {
    const itemStyle = options.tabBarItemStyle as { display?: string } | undefined;
    if (itemStyle?.display === "none") return true;
    const href = (options as { href?: string | null }).href;
    return href === null;
}

export function getMainTabEntries(
    state: BottomTabBarProps["state"],
    descriptors: BottomTabBarProps["descriptors"]
): TabBarEntry[] {
    const entries: TabBarEntry[] = [];

    for (const name of MAIN_TAB_ORDER) {
        const routeIndex = state.routes.findIndex((r) => r.name === name);
        if (routeIndex === -1) continue;

        const route = state.routes[routeIndex];
        const options = descriptors[route.key].options;
        if (isTabHidden(options)) continue;

        entries.push({ route, routeIndex, options });
    }

    return entries;
}
