import { useFocusEffect } from "expo-router";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type TabBarVisibilityContextValue = {
    hidden: boolean;
    setHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | null>(null);

export function TabBarVisibilityProvider({ children }: { children: ReactNode }) {
    const [hidden, setHidden] = useState(false);
    const value = useMemo(() => ({ hidden, setHidden }), [hidden]);
    return (
        <TabBarVisibilityContext.Provider value={value}>
            {children}
        </TabBarVisibilityContext.Provider>
    );
}

export function useTabBarVisibility() {
    const ctx = useContext(TabBarVisibilityContext);
    if (!ctx) {
        throw new Error("useTabBarVisibility must be used within TabBarVisibilityProvider");
    }
    return ctx;
}

/** Hide the tab bar while this screen is focused (NativeTabs `hidden` + JS `tabBar={null}`). */
export function useHideTabBar() {
    const { setHidden } = useTabBarVisibility();
    useFocusEffect(
        useCallback(() => {
            setHidden(true);
            return () => setHidden(false);
        }, [setHidden])
    );
}
