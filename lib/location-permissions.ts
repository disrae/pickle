export type LocationCheckInMode = "off" | "foreground" | "background";

type ExpoLocation = typeof import("expo-location");

let locationModule: ExpoLocation | null = null;
let locationUnavailable = false;

function isValidLocationModule(mod: unknown): mod is ExpoLocation {
    return (
        typeof mod === "object" &&
        mod !== null &&
        typeof (mod as ExpoLocation).requestForegroundPermissionsAsync === "function"
    );
}

export async function getLocationModule(): Promise<ExpoLocation | null> {
    if (locationUnavailable) return null;
    if (locationModule) return locationModule;
    try {
        const mod = await import("expo-location");
        if (!isValidLocationModule(mod)) {
            locationUnavailable = true;
            return null;
        }
        locationModule = mod;
        return locationModule;
    } catch {
        locationUnavailable = true;
        return null;
    }
}

export async function requestLocationPermissionForMode(
    mode: LocationCheckInMode
): Promise<{ granted: boolean; unavailable?: boolean }> {
    if (mode === "off") return { granted: true };

    const location = await getLocationModule();
    if (!location) return { granted: false, unavailable: true };

    const { status } = await location.requestForegroundPermissionsAsync();
    if (status !== "granted") return { granted: false };

    if (mode === "background") {
        const bg = await location.requestBackgroundPermissionsAsync();
        if (bg.status !== "granted") return { granted: false };
    }

    return { granted: true };
}
