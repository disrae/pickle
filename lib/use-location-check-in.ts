import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getLocationModule } from "@/lib/location-permissions";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

const CHECK_IN_RADIUS_M = 200;
/** Larger than check-in radius to avoid GPS jitter toggling check-in/out at the boundary */
const CHECK_OUT_RADIUS_M = 280;
const ACTION_COOLDOWN_MS = 60_000;
/** Must stay inside the geofence this long before auto check-in (avoids biking/driving past) */
const MIN_DWELL_BEFORE_CHECK_IN_MS = 3 * 60 * 1000;

type LocationSubscription = { remove: () => void };
type LocationCoords = {
    latitude: number;
    longitude: number;
};

type GeofenceTarget = {
    courtId: Id<"courts">;
    lat: number;
    lng: number;
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

/** Foreground/background auto check-in/out when user is near their court */
export function useLocationCheckIn() {
    const user = useQuery(api.users.currentUser);
    const defaultCourt = useQuery(api.courts.getDefault);
    const currentCheckIn = useQuery(api.checkIns.getCurrentUserCheckIn);
    const checkedInCourt = useQuery(
        api.courts.get,
        currentCheckIn ? { id: currentCheckIn.courtId } : "skip"
    );
    const checkIn = useMutation(api.checkIns.checkIn);
    const checkOut = useMutation(api.checkIns.checkOut);

    const geofenceRef = useRef<GeofenceTarget | null>(null);
    const isCheckedInRef = useRef(false);
    const insideGeofenceSinceRef = useRef<number | null>(null);
    const lastCheckInAttempt = useRef(0);
    const lastCheckOutAttempt = useRef(0);

    useEffect(() => {
        isCheckedInRef.current = !!currentCheckIn;
        if (!currentCheckIn) {
            insideGeofenceSinceRef.current = null;
        }
        if (currentCheckIn && checkedInCourt) {
            geofenceRef.current = {
                courtId: currentCheckIn.courtId,
                lat: checkedInCourt.location.lat,
                lng: checkedInCourt.location.lng,
            };
        } else if (defaultCourt) {
            geofenceRef.current = {
                courtId: defaultCourt._id,
                lat: defaultCourt.location.lat,
                lng: defaultCourt.location.lng,
            };
        } else {
            geofenceRef.current = null;
        }
    }, [currentCheckIn, checkedInCourt, defaultCourt]);

    useEffect(() => {
        if (Platform.OS === "web") return;
        if (!user) return;
        if (user.locationCheckInMode !== "foreground" && user.locationCheckInMode !== "background") {
            return;
        }

        let subscription: LocationSubscription | null = null;

        const handleLocation = async (coords: LocationCoords) => {
            const target = geofenceRef.current;
            if (!target) return;

            const dist = distanceMeters(
                coords.latitude,
                coords.longitude,
                target.lat,
                target.lng
            );
            const now = Date.now();

            if (isCheckedInRef.current) {
                if (dist <= CHECK_OUT_RADIUS_M) return;
                if (now - lastCheckOutAttempt.current < ACTION_COOLDOWN_MS) return;

                lastCheckOutAttempt.current = now;
                try {
                    await checkOut();
                } catch {
                    // Not checked in or error
                }
            } else {
                if (dist > CHECK_IN_RADIUS_M) {
                    insideGeofenceSinceRef.current = null;
                    return;
                }

                if (!insideGeofenceSinceRef.current) {
                    insideGeofenceSinceRef.current = now;
                    return;
                }

                if (now - insideGeofenceSinceRef.current < MIN_DWELL_BEFORE_CHECK_IN_MS) {
                    return;
                }

                if (now - lastCheckInAttempt.current < ACTION_COOLDOWN_MS) return;

                lastCheckInAttempt.current = now;
                try {
                    await checkIn({ courtId: target.courtId, isPrivate: false });
                } catch {
                    // Already checked in or error
                }
            }
        };

        const start = async () => {
            const location = await getLocationModule();
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
            await handleLocation(loc.coords);

            subscription = await location.watchPositionAsync(
                {
                    accuracy: location.Accuracy.Balanced,
                    distanceInterval: 50,
                    timeInterval: 30_000,
                },
                (loc) => handleLocation(loc.coords)
            );
        };

        start();

        const appStateSub = AppState.addEventListener("change", (state) => {
            if (state !== "active" || user.locationCheckInMode !== "foreground") return;
            void getLocationModule().then((location) => {
                if (!location) return;
                return location
                    .getCurrentPositionAsync({ accuracy: location.Accuracy.Balanced })
                    .then((loc) => handleLocation(loc.coords));
            });
        });

        return () => {
            subscription?.remove();
            appStateSub.remove();
        };
    }, [user, checkIn, checkOut]);
}
