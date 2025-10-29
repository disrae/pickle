import { Background } from "@/components/ui/Background";
import { Popup } from "@/components/ui/Popup";
import { SetNamePopup } from "@/components/ui/SetNamePopup";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { top } = useSafeAreaInsets();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const { signOut } = useAuthActions();

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupTitle, setPopupTitle] = useState<string | undefined>(undefined);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupOnConfirm, setPopupOnConfirm] = useState<(() => Promise<void> | void) | undefined>(undefined);
    const [popupConfirmText, setPopupConfirmText] = useState<string | undefined>(undefined);
    const [showNamePopup, setShowNamePopup] = useState(false);

    const showPopup = (title: string | undefined, message: string, onConfirm?: () => Promise<void> | void, confirmText?: string) => {
        setPopupTitle(title);
        setPopupMessage(message);
        setPopupOnConfirm(() => onConfirm);
        setPopupConfirmText(confirmText);
        setPopupVisible(true);
    };

    const _signout = () => {
        signOut();
    };

    const handleSignOut = () => {
        showPopup(
            "Sign Out",
            "Are you sure you want to sign out?",
            () => signOut(),
            "Sign Out"
        );
    };

    const settingsOptions = [
        {
            id: "court",
            title: "Home Court",
            subtitle: "Jericho Pickle Courts",
            icon: "location",
            onPress: () => {
                // TODO: Navigate to court selection
                showPopup("Coming Soon", "Court selection will be available soon!");
            },
        },
        {
            id: "notifications",
            title: "Notifications",
            subtitle: "Manage your alerts",
            icon: "notifications",
            onPress: () => {
                // TODO: Navigate to notifications settings
                showPopup("Coming Soon", "Notification settings coming soon!");
            },
        },
        {
            id: "privacy",
            title: "Privacy & Security",
            subtitle: "Manage your data",
            icon: "shield-checkmark",
            onPress: () => {
                // TODO: Navigate to privacy settings
                showPopup("Coming Soon", "Privacy settings coming soon!");
            },
        },
    ];

    return (
        <Background>
            <ScrollView className="flex-1">
                <View
                    className="px-6 pb-6"
                    style={{ paddingTop: top + 20 }}
                >
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-slate-800">
                            Profile
                        </Text>
                    </View>

                    {/* User Info Card */}
                    <View className="bg-white/95 rounded-3xl p-6 mb-4 shadow-lg">
                        <View className="items-center mb-4">
                            {/* Avatar Placeholder */}
                            <View className="w-24 h-24 rounded-full bg-lime-400 items-center justify-center mb-4">
                                <Text className="text-4xl font-bold text-white">
                                    {user?.email?.[0]?.toUpperCase() || "?"}
                                </Text>
                            </View>

                            <Text className="text-2xl font-bold text-slate-800">
                                {user?.name || "Pickle Player"}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setShowNamePopup(true)}
                                className="flex-row items-center mt-2 px-3 py-1 rounded-full bg-lime-100"
                            >
                                <Ionicons name="create-outline" size={16} color="#65a30d" />
                                <Text className="text-lime-700 ml-1 text-sm font-medium">
                                    Edit Name
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center mt-3">
                                <Ionicons name="mail" size={16} color="#64748b" />
                                <Text className="text-slate-500 ml-2">
                                    {user?.email || "No email"}
                                </Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row justify-around pt-4 border-t border-slate-200">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Games</Text>
                            </View>
                            <View className="h-full w-px bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Hours</Text>
                            </View>
                            <View className="h-full w-px bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-lime-600">0</Text>
                                <Text className="text-slate-500 text-sm mt-1">Friends</Text>
                            </View>
                        </View>
                    </View>

                    {/* Settings Section */}
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                        Settings
                    </Text>

                    {settingsOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={option.onPress}
                            className="bg-white/95 rounded-2xl p-5 mb-3 shadow"
                        >
                            <View className="flex-row items-center">
                                <View className="bg-lime-100 rounded-full p-3 mr-4">
                                    <Ionicons name={option.icon as any} size={24} color="#65a30d" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-slate-800">
                                        {option.title}
                                    </Text>
                                    <Text className="text-slate-500 text-sm mt-1">
                                        {option.subtitle}
                                    </Text>
                                </View>
                                <Text className="text-slate-400">›</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Sign Out Button */}
                    <View className="mt-6">
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="bg-red-50 rounded-2xl p-5 border border-red-200"
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                                <Text className="text-red-600 font-semibold ml-2 text-lg">
                                    Sign Out
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* App Info */}
                    <Text className="text-slate-400 text-center text-sm mt-8">
                        Jericho Pickle v1.0.0
                    </Text>
                </View>
            </ScrollView>
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

