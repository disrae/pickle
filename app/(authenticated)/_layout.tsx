import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
    // Authenticated - render nested routes
    return <Stack screenOptions={{ headerShown: false }} />;
}

