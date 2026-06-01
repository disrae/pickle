export type LocationCheckInMode = "off" | "foreground" | "background";

type ExpoLocation = typeof import("expo-location");

let locationModule: ExpoLocation | null = null;

async function getLocationModule(): Promise<ExpoLocation | null> {
    if (locationModule) return locationModule;
    try {
        locationModule = await import("expo-location");
        return locationModule;
    } catch {
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
