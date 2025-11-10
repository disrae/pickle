import { SetNamePopup } from "@/components/ui/SetNamePopup";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
    const user = useQuery(api.users.currentUser);

    // Check if user needs to set their name
    const needsName = user && !user.name?.trim();

    // Show popup when user needs a name
    if (needsName) {
        return (
            <>
                <Stack screenOptions={{ headerShown: false }} />
                <SetNamePopup
                    isVisible={true}
                    onClose={() => {
                        // Popup will close automatically after successful save
                        // No need to do anything here for required popup
                    }}
                    isRequired={true}
                />
            </>
        );
    }

    // Authenticated - render nested routes
    return <Stack screenOptions={{ headerShown: false }} />;
}

