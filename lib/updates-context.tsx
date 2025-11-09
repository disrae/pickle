import * as Updates from "expo-updates";
import { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UpdatesContextType {
    isUpdateAvailable: boolean;
    isChecking: boolean;
    isDownloading: boolean;
    updateInfo: Updates.UpdateCheckResult | null;
    currentUpdateId: string | undefined;
    runtimeVersion: string | undefined;
    channel: string | undefined;
    lastCheckTime: Date | undefined;
    checkForUpdate: () => Promise<void>;
    applyUpdate: () => Promise<void>;
}

const UpdatesContext = createContext<UpdatesContextType | undefined>(undefined);

export function UpdatesProvider({ children }: { children: React.ReactNode }) {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<Updates.UpdateCheckResult | null>(null);
    const [lastCheckTime, setLastCheckTime] = useState<Date | undefined>(undefined);

    const { 
        currentlyRunning, 
        isUpdateAvailable: hookUpdateAvailable,
        isUpdatePending: hookUpdatePending,
    } = Updates.useUpdates();

    const checkForUpdate = async () => {
        // Skip in development mode
        if (__DEV__ || !Updates.isEnabled) {
            console.log("Updates disabled in development mode");
            return;
        }

        try {
            setIsChecking(true);
            setLastCheckTime(new Date());
            
            const checkResult = await Updates.checkForUpdateAsync();
            setUpdateInfo(checkResult);

            if (checkResult.isAvailable) {
                console.log("Update available, downloading...");
                setIsDownloading(true);
                
                const fetchResult = await Updates.fetchUpdateAsync();
                
                if (fetchResult.isNew) {
                    console.log("New update downloaded successfully");
                    setIsUpdateAvailable(true);
                } else {
                    console.log("Update fetch result:", fetchResult);
                }
                
                setIsDownloading(false);
            } else {
                console.log("No update available");
                setIsUpdateAvailable(false);
            }
        } catch (error) {
            console.error("Error checking for updates:", error);
            setIsUpdateAvailable(false);
        } finally {
            setIsChecking(false);
        }
    };

    const applyUpdate = async () => {
        try {
            await Updates.reloadAsync();
        } catch (error) {
            console.error("Error applying update:", error);
        }
    };

    // Check for updates on mount and when app comes to foreground
    useEffect(() => {
        // Initial check
        checkForUpdate();

        // Listen to app state changes
        const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                // App has come to foreground, check for updates
                checkForUpdate();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Also use the hook's state as a fallback
    useEffect(() => {
        if (hookUpdateAvailable || hookUpdatePending) {
            setIsUpdateAvailable(true);
        }
    }, [hookUpdateAvailable, hookUpdatePending]);

    return (
        <UpdatesContext.Provider
            value={{
                isUpdateAvailable,
                isChecking,
                isDownloading,
                updateInfo,
                currentUpdateId: currentlyRunning.updateId,
                runtimeVersion: currentlyRunning.runtimeVersion,
                channel: currentlyRunning.channel,
                lastCheckTime,
                checkForUpdate,
                applyUpdate,
            }}
        >
            {children}
        </UpdatesContext.Provider>
    );
}

export function useUpdatesContext() {
    const context = useContext(UpdatesContext);
    if (context === undefined) {
        throw new Error("useUpdatesContext must be used within UpdatesProvider");
    }
    return context;
}

