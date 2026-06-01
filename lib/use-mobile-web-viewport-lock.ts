import { useEffect } from "react";
import { isMobileWeb } from "./is-mobile-web";

const LOCK_CLASS = "mobile-web-lock";

export function useMobileWebViewportLock() {
    useEffect(() => {
        if (!isMobileWeb()) return;

        document.documentElement.classList.add(LOCK_CLASS);
        document.body.classList.add(LOCK_CLASS);

        return () => {
            document.documentElement.classList.remove(LOCK_CLASS);
            document.body.classList.remove(LOCK_CLASS);
        };
    }, []);
}
