import { requestNotificationPermissions } from "@/lib/notifications";

/** Prompt for notifications and save token — call when enabling auto check-in */
export async function registerCoachPushNotifications(
    saveExpoPushToken: (args: { token: string }) => Promise<void>
) {
    const token = await requestNotificationPermissions();
    if (token) {
        await saveExpoPushToken({ token });
    }
}
