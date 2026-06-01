import { LocationCheckInModeSheet } from "@/components/court/LocationCheckInModeSheet";
import { Popup } from "@/components/ui/Popup";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";

/** First-visit prompt on Court tab when locationCheckInMode is unset */
export function LocationCheckInPrompt() {
    const user = useQuery(api.users.currentUser);
    const [locationPopup, setLocationPopup] = useState<{ title: string; message: string } | null>(
        null
    );

    const isVisible =
        user !== undefined && user !== null && user.locationCheckInMode === undefined;

    return (
        <>
            <LocationCheckInModeSheet
                isVisible={isVisible}
                onDismiss={() => {}}
                onPermissionDenied={() =>
                    setLocationPopup({
                        title: "Location access needed",
                        message:
                            "Enable location in Settings to use auto check-in, or choose Manual only.",
                    })
                }
                onUnavailable={() =>
                    setLocationPopup({
                        title: "Location unavailable",
                        message: "Install and run a native build to enable auto check-in.",
                    })
                }
            />
            <Popup
                isVisible={!!locationPopup}
                onClose={() => setLocationPopup(null)}
                title={locationPopup?.title}
                message={locationPopup?.message ?? ""}
            />
        </>
    );
}
