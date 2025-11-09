import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Check if user has granted notification permissions
 */
export async function hasNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
}

/**
 * Request notification permissions and register for push tokens
 * Returns the push token if successful, null otherwise
 */
export async function requestNotificationPermissions(): Promise<string | null> {
    // Android notification channel setup
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#84cc16",
        });
    }

    // Only work on physical devices
    if (!Device.isDevice) {
        console.warn("Push notifications only work on physical devices");
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not granted
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // Return null if permission not granted
    if (finalStatus !== "granted") {
        console.warn("Notification permission not granted");
        return null;
    }

    // Get project ID
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
        console.error("Project ID not found");
        return null;
    }

    try {
        // Get push token
        const pushToken = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        
        return pushToken.data;
    } catch (error) {
        console.error("Error getting push token:", error);
        return null;
    }
}

/**
 * Send a push notification via Expo push service
 */
export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
) {
    const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: data || {},
    };

    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}

