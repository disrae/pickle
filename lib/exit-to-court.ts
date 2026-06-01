import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { Router } from "expo-router";

function getTabNavigator(navigation: NavigationProp<ParamListBase>) {
    let nav: NavigationProp<ParamListBase> | undefined = navigation;
    while (nav) {
        const state = nav.getState?.();
        if (state?.type === "tab") return nav;
        nav = nav.getParent?.() as NavigationProp<ParamListBase> | undefined;
    }
    return undefined;
}

/** Leave coach chat and show the Court tab (reliable on iOS native tabs). */
export function exitCoachChatToCourt(
    router: Router,
    navigation: NavigationProp<ParamListBase>
) {
    const tabNav = getTabNavigator(navigation);
    if (tabNav?.navigate) {
        tabNav.navigate("court" as never);
        return;
    }
    router.replace("/(authenticated)/(tabs)/court");
}
