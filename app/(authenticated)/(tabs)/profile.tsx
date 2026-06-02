import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { Popup } from "@/components/ui/Popup";
import { SetNamePopup } from "@/components/ui/SetNamePopup";
import { api } from "@/convex/_generated/api";
import { useUpdatesContext } from "@/lib/updates-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import Constants from "expo-constants";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useHeaderHeight } from "@/lib/header-layout";
import { requestLocationPermissionForMode } from "@/lib/location-permissions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const user = useQuery(api.users.currentUser);
    const profileImageUrl = useQuery(api.users.getProfileImageUrl);
    const { signOut } = useAuthActions();
    const {
        isUpdateAvailable,
        isChecking,
        isDownloading,
        currentUpdateId,
        runtimeVersion,
        channel,
        lastCheckTime,
        applyUpdate,
        checkForUpdate,
    } = useUpdatesContext();

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupTitle, setPopupTitle] = useState<string | undefined>(undefined);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupOnConfirm, setPopupOnConfirm] = useState<(() => Promise<void> | void) | undefined>(undefined);
    const [popupConfirmText, setPopupConfirmText] = useState<string | undefined>(undefined);
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const saveProfileImage = useMutation(api.users.saveProfileImage);
    const deleteAccount = useMutation(api.users.deleteAccount);
    const updateAppearAtCourt = useMutation(api.users.updateAppearAtCourt);
    const updateLocationCheckInMode = useMutation(api.users.updateLocationCheckInMode);

    const appearAtCourt = user?.appearAtCourt !== false;
    const locationMode = user?.locationCheckInMode ?? "off";

    // Get app version from Constants
    const appVersion = Constants.expoConfig?.version || "1.0.0";

    const showPopup = (title: string | undefined, message: string, onConfirm?: () => Promise<void> | void, confirmText?: string) => {
        setPopupTitle(title);
        setPopupMessage(message);
        setPopupOnConfirm(() => onConfirm);
        setPopupConfirmText(confirmText);
        setPopupVisible(true);
    };

    const handleSignOut = () => {
        showPopup(
            "Sign Out",
            "Are you sure you want to sign out?",
            async () => {
                await signOut();
                router.replace("/login");
            },
            "Sign Out"
        );
    };

    const handleDeleteAccount = () => {
        showPopup(
            "Delete Account",
            "This will permanently delete your account and all associated data. This action cannot be undone.",
            async () => {
                await deleteAccount();
                await signOut();
                router.replace("/login");
            },
            "Delete Account"
        );
    };

    const handleImagePick = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                showPopup("Permission Required", "We need access to your photo library to update your profile picture.");
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploadingImage(true);

                // Get upload URL
                const uploadUrl = await generateUploadUrl();

                // Upload image
                const response = await fetch(result.assets[0].uri);
                const blob = await response.blob();

                const uploadResponse = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": blob.type },
                    body: blob,
                });

                const { storageId } = await uploadResponse.json();

                // Save storage ID to user
                await saveProfileImage({ storageId });

                setIsUploadingImage(false);
            }
        } catch (error) {
            console.error("Image upload error:", error);
            setIsUploadingImage(false);
            showPopup("Upload Failed", "There was an error uploading your profile picture. Please try again.");
        }
    };

    return (
        <Background>
            <View className="flex-1">
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(bottom, 32) }}
                >
                    {/* Profile Card */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <View className="items-center mb-6">
                            {/* Profile Image */}
                            <TouchableOpacity
                                onPress={handleImagePick}
                                disabled={isUploadingImage}
                                className="relative"
                            >
                                <View className="w-32 h-32 rounded-full bg-brand items-center justify-center">
                                    {isUploadingImage ? (
                                        <ActivityIndicator size="large" color="white" />
                                    ) : profileImageUrl ? (
                                        <Image
                                            source={{ uri: profileImageUrl }}
                                            style={{
                                                width: 128,
                                                height: 128,
                                                borderRadius: 64,
                                            }}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <Text className="text-6xl font-bold text-white">
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                                        </Text>
                                    )}
                                </View>
                                {!isUploadingImage && (
                                    <View className="absolute bottom-0 right-0 bg-brand rounded-full p-2 border-4 border-border">
                                        <Ionicons name="camera" size={20} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Name */}
                            <Text className="text-3xl font-bold text-foreground mt-4">
                                {user?.name || "Pickle Player"}
                            </Text>

                            {/* Edit Name Button */}
                            <TouchableOpacity
                                onPress={() => setShowNamePopup(true)}
                                className="flex-row items-center mt-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-brand"
                            >
                                <Ionicons name="create-outline" size={16} color="#3F7D20" />
                                <Text className="text-brand-strong ml-1.5 text-sm font-semibold">
                                    Edit Name
                                </Text>
                            </TouchableOpacity>

                            {/* Email with Privacy Notice */}
                            <View className="items-center mt-4">
                                <View className="flex-row items-center">
                                    <Ionicons name="mail" size={16} color="#5c6454" />
                                    <Text className="text-foreground ml-2">
                                        {user?.email || "No email"}
                                    </Text>
                                </View>
                                <View className="flex-row items-center mt-2 px-3 py-1 rounded-lg bg-surface-2">
                                    <Ionicons name="lock-closed" size={12} color="#5c6454" />
                                    <Text className="text-foreground-muted text-xs ml-1">
                                        Your email is private and only visible to you
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </GlassContainer>

                    {/* Court & presence */}
                    <GlassContainer style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
                        <Text className="text-xl font-bold text-foreground mb-4">Court & presence</Text>

                        <View className="flex-row items-center justify-between py-3 border-b border-border">
                            <View className="flex-1 pr-4">
                                <Text className="text-foreground font-semibold">Appear at the court</Text>
                                <Text className="text-foreground-muted text-sm mt-1">
                                    Others can see you&apos;re here. Turn off for ghost mode.
                                </Text>
                            </View>
                            <Switch
                                value={appearAtCourt}
                                onValueChange={(v) => updateAppearAtCourt({ appearAtCourt: v })}
                                trackColor={{ false: "#c4c9bd", true: "#3F7D20" }}
                                thumbColor="#fff"
                            />
                        </View>

                        <Text className="text-foreground-muted text-sm mt-4 mb-2">Auto check-in</Text>
                        {(
                            [
                                ["off", "Manual only"],
                                ["foreground", "Only when the app is open"],
                                ["background", "Even when it's in my pocket"],
                            ] as const
                        ).map(([mode, label]) => (
                            <TouchableOpacity
                                key={mode}
                                onPress={async () => {
                                    const { granted, unavailable } =
                                        await requestLocationPermissionForMode(mode);
                                    if (unavailable) {
                                        showPopup(
                                            "Location unavailable",
                                            "Install and run a native build to enable auto check-in."
                                        );
                                        return;
                                    }
                                    if (!granted) return;
                                    await updateLocationCheckInMode({ mode });
                                }}
                                className={`py-3 px-4 rounded-xl mb-2 border ${
                                    locationMode === mode
                                        ? "border-brand bg-brand/10"
                                        : "border-border bg-surface-2"
                                }`}
                            >
                                <Text
                                    className={
                                        locationMode === mode
                                            ? "text-brand-strong font-semibold"
                                            : "text-foreground"
                                    }
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => router.push("/builder")}
                            className="flex-row items-center justify-between mt-4 pt-4 border-t border-border"
                        >
                            <Text className="text-foreground font-semibold">Feature ideas (Builder)</Text>
                            <Ionicons name="chevron-forward" size={20} color="#5c6454" />
                        </TouchableOpacity>
                    </GlassContainer>

                    {/* Account Actions */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <Text className="text-xl font-bold text-foreground mb-4">
                            Account
                        </Text>

                        {/* Sign Out Button */}
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="flex-row items-center justify-between p-4 rounded-xl bg-surface-2 border border-border mb-3"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-surface-2 rounded-full p-2 mr-3">
                                    <Ionicons name="log-out-outline" size={20} color="#5c6454" />
                                </View>
                                <Text className="text-foreground font-semibold text-lg">
                                    Sign Out
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#5c6454" />
                        </TouchableOpacity>

                        {/* Delete Account Button */}
                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                            className="flex-row items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-red-100 rounded-full p-2 mr-3">
                                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                                </View>
                                <View>
                                    <Text className="text-red-600 font-semibold text-lg">
                                        Delete Account
                                    </Text>
                                    <Text className="text-red-500 text-sm mt-0.5">
                                        This action cannot be undone
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
                        </TouchableOpacity>
                    </GlassContainer>

                    {/* App Info & Updates */}
                    <GlassContainer
                        style={{
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 16,
                        }}
                    >
                        <Text className="text-xl font-bold text-foreground mb-4">
                            App Info
                        </Text>

                        {/* Version Info */}
                        <View className="space-y-2 mb-4">
                            <View className="flex-row justify-between py-2">
                                <Text className="text-foreground-muted text-sm">Version</Text>
                                <Text className="text-foreground text-sm font-semibold">
                                    {appVersion}
                                </Text>
                            </View>
                            {runtimeVersion && (
                                <View className="flex-row justify-between py-2">
                                    <Text className="text-foreground-muted text-sm">Runtime</Text>
                                    <Text className="text-foreground text-sm font-mono">
                                        {runtimeVersion}
                                    </Text>
                                </View>
                            )}
                            {channel && (
                                <View className="flex-row justify-between py-2">
                                    <Text className="text-foreground-muted text-sm">Channel</Text>
                                    <Text className="text-foreground text-sm font-semibold">
                                        {channel}
                                    </Text>
                                </View>
                            )}
                            {currentUpdateId && (
                                <View className="flex-row justify-between py-2">
                                    <Text className="text-foreground-muted text-sm">Update ID</Text>
                                    <Text className="text-foreground text-xs font-mono" numberOfLines={1}>
                                        {currentUpdateId.substring(0, 16)}...
                                    </Text>
                                </View>
                            )}
                            {lastCheckTime && (
                                <View className="flex-row justify-between py-2">
                                    <Text className="text-foreground-muted text-sm">Last Check</Text>
                                    <Text className="text-foreground text-xs">
                                        {lastCheckTime.toLocaleTimeString()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Update Button - Only show when update is available */}
                        {isUpdateAvailable && (
                            <TouchableOpacity
                                onPress={applyUpdate}
                                className="flex-row items-center justify-between p-4 rounded-xl bg-brand/20 border border-brand"
                            >
                                <View className="flex-row items-center">
                                    <View className="bg-brand/30 rounded-full p-2 mr-3">
                                        <Ionicons name="cloud-download" size={20} color="#3F7D20" />
                                    </View>
                                    <View>
                                        <Text className="text-brand-strong font-semibold text-lg">
                                            Update Available
                                        </Text>
                                        <Text className="text-brand-strong/90 text-sm mt-0.5">
                                            Tap to restart and update
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#3F7D20" />
                            </TouchableOpacity>
                        )}

                        {/* Check for Updates Button */}
                        {!isUpdateAvailable && (
                            <TouchableOpacity
                                onPress={checkForUpdate}
                                disabled={isChecking || isDownloading}
                                className="flex-row items-center justify-center p-4 rounded-xl bg-surface-2 border border-border"
                            >
                                {isChecking || isDownloading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#3F7D20" />
                                        <Text className="text-foreground ml-2 font-semibold">
                                            {isDownloading ? "Downloading..." : "Checking..."}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="refresh" size={20} color="#5c6454" />
                                        <Text className="text-foreground ml-2 font-semibold">
                                            Check for Updates
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </GlassContainer>

                    {isLiquidGlassAvailable() && <View className="h-20" />}
                </ScrollView>

            </View>

            <Header title="Profile" />

            <Popup
                isVisible={popupVisible}
                onClose={() => setPopupVisible(false)}
                title={popupTitle}
                message={popupMessage}
                onConfirm={popupOnConfirm}
                confirmText={popupConfirmText}
            />
            <SetNamePopup
                isVisible={showNamePopup}
                onClose={() => setShowNamePopup(false)}
                currentName={user?.name || ""}
                isRequired={false}
            />
        </Background>
    );
}
