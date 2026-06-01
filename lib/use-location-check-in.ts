import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

const COURT_RADIUS_M = 200;
type ExpoLocation = typeof import("expo-location");
type LocationSubscription = { remove: () => void };
type LocationCoords = {
    latitude: number;
    longitude: number;
};

function distanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Foreground/background location check-in when user is near their court */
export function useLocationCheckIn(courtId: Id<"courts"> | undefined) {
    const user = useQuery(api.users.currentUser);
    const court = useQuery(api.courts.get, courtId ? { id: courtId } : "skip");
    const currentCheckIn = useQuery(api.checkIns.getCurrentUserCheckIn);
    const checkIn = useMutation(api.checkIns.checkIn);
    const lastAttempt = useRef(0);
    const locationModuleRef = useRef<ExpoLocation | null>(null);

    useEffect(() => {
        if (Platform.OS === "web") return;
        if (!user || !court || !courtId) return;
        if (user.locationCheckInMode !== "foreground" && user.locationCheckInMode !== "background") return;
        if (currentCheckIn) return;

        let subscription: LocationSubscription | null = null;

        const tryCheckIn = async (coords: LocationCoords) => {
            const now = Date.now();
            if (now - lastAttempt.current < 60_000) return;

            const dist = distanceMeters(
                coords.latitude,
                coords.longitude,
                court.location.lat,
                court.location.lng
            );

            if (dist <= COURT_RADIUS_M) {
                lastAttempt.current = now;
                try {
                    await checkIn({ courtId, isPrivate: false });
                } catch {
                    // Already checked in or error
                }
            }
        };

        const start = async () => {
            if (!locationModuleRef.current) {
                try {
                    locationModuleRef.current = await import("expo-location");
                } catch {
                    // Native module not available in current runtime.
                    return;
                }
            }
            const location = locationModuleRef.current;
            if (!location) return;

            const { status } = await location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            if (user.locationCheckInMode === "background") {
                const bg = await location.requestBackgroundPermissionsAsync();
                if (bg.status !== "granted") return;
            }

            const loc = await location.getCurrentPositionAsync({
                accuracy: location.Accuracy.Balanced,
            });
            await tryCheckIn(loc.coords);

            subscription = await location.watchPositionAsync(
                {
                    accuracy: location.Accuracy.Balanced,
                    distanceInterval: 50,
                    timeInterval: 30_000,
                },
                (loc) => tryCheckIn(loc.coords)
            );
        };

        start();

        const appStateSub = AppState.addEventListener("change", (state) => {
            const location = locationModuleRef.current;
            if (!location) return;
            if (state === "active" && user.locationCheckInMode === "foreground") {
                location.getCurrentPositionAsync({ accuracy: location.Accuracy.Balanced }).then(
                    (loc) => tryCheckIn(loc.coords)
                );
            }
        });

        return () => {
            subscription?.remove();
            appStateSub.remove();
        };
    }, [user, court, courtId, currentCheckIn, checkIn]);
}
