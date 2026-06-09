import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getPushTokenIfPermitted } from "@/lib/notifications";
import { useMutation } from "convex/react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

function openCoachFromNotification(data: Record<string, unknown>) {
    if (data.type === "coach_match_debrief" && typeof data.matchId === "string") {
        router.push({
            pathname: "/(authenticated)/(tabs)/coach/chat",
            params: { debriefMatchId: data.matchId as Id<"matches"> },
        });
        return;
    }

    if (data.type === "coach_session_debrief") {
        router.push("/(authenticated)/(tabs)/coach/chat");
    }
}

/** Register push token + deep-link coach notifications when authenticated */
export function usePushNotifications(enabled: boolean) {
    const saveExpoPushToken = useMutation(api.users.saveExpoPushToken);
    const handledResponseId = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled || Platform.OS === "web") return;

        void getPushTokenIfPermitted().then((token) => {
            if (token) void saveExpoPushToken({ token });
        });
    }, [enabled, saveExpoPushToken]);

    useEffect(() => {
        if (!enabled || Platform.OS === "web") return;

        const handleResponse = (response: Notifications.NotificationResponse) => {
            const id = response.notification.request.identifier;
            if (handledResponseId.current === id) return;
            handledResponseId.current = id;

            const data = response.notification.request.content.data;
            if (data && typeof data === "object") {
                openCoachFromNotification(data as Record<string, unknown>);
            }
        };

        void Notifications.getLastNotificationResponseAsync().then((response) => {
            if (response) handleResponse(response);
        });

        const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);
        return () => sub.remove();
    }, [enabled]);
}
