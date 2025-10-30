import { ChatBackground } from "@/components/ui/Background";
import { ChatFAB } from "@/components/ui/ChatFAB";
import { Header } from "@/components/ui/header";
import { NewChatModal } from "@/components/ui/NewChatModal";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingChatsListScreen() {
    const { top } = useSafeAreaInsets();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    const allChats = useQuery(api.trainingChats.list);
    const searchResults = useQuery(
        api.trainingChats.search,
        searchQuery.trim() ? { searchTerm: searchQuery } : "skip"
    );

    const createChat = useMutation(api.trainingChats.create);

    const chats = searchQuery.trim() ? searchResults : allChats;

    const handleCreateChat = async (title: string, description?: string) => {
        const chatId = await createChat({
            title,
            description,
        });
        router.push(`/training/chats/${chatId}`);
    };

    const formatLastMessageTime = (timestamp?: number) => {
        if (!timestamp) return "No messages yet";

        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const headerHeight = top + 80;

    return (
        <ChatBackground>
            <ScrollView
                className="flex-1 pt-4"
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 100 }}
            >
                {/* Search Bar */}
                <View className="px-4 mb-4">
                    <View className="bg-white/95 rounded-2xl px-4 py-3 flex-row items-center">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search training chats..."
                            className="flex-1 ml-2 text-slate-800 text-base"
                            placeholderTextColor="#94a3b8"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Chat List */}
                <View className="px-4">
                    {!chats ? (
                        <View className="items-center justify-center py-12">
                            <ActivityIndicator size="large" color="#a3e635" />
                        </View>
                    ) : chats.length === 0 ? (
                        <View className="bg-white/95 rounded-3xl p-8 items-center">
                            <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
                            <Text className="text-slate-400 text-center mt-4 text-lg font-semibold">
                                {searchQuery.trim() ? "No chats found" : "No training chats yet"}
                            </Text>
                            <Text className="text-slate-400 text-center text-sm mt-2">
                                {searchQuery.trim()
                                    ? "Try a different search term"
                                    : "Create the first training chat!"}
                            </Text>
                        </View>
                    ) : (
                        <View className="bg-white/95 rounded-xl overflow-hidden">
                            {chats.map((chat, index) => (
                                <View key={chat._id}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push(`/training/chats/${chat._id}`)
                                        }
                                        className="px-4 py-3 active:bg-slate-100"
                                        activeOpacity={0.95}
                                    >
                                        <View className="flex-row items-start justify-between mb-1">
                                            <Text className="text-base font-semibold text-slate-800 flex-1 mr-2">
                                                {chat.title}
                                            </Text>
                                            <Text className="text-xs text-slate-400">
                                                {formatLastMessageTime(chat.lastMessageAt)}
                                            </Text>
                                        </View>

                                        {chat.description && (
                                            <Text
                                                className="text-sm text-slate-600 mb-1"
                                                numberOfLines={2}
                                            >
                                                {chat.description}
                                            </Text>
                                        )}

                                        <View className="flex-row items-center">
                                            <Ionicons name="people" size={14} color="#84cc16" />
                                            <Text className="text-xs text-slate-500 ml-1">
                                                {chat.participantCount}{" "}
                                                {chat.participantCount === 1
                                                    ? "participant"
                                                    : "participants"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    {index < chats.length - 1 && (
                                        <View className="h-[1px] bg-slate-200 ml-4" />
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Header
                title="Training Chats"
                titleSize="text-2xl"
                rightButton="back"
                onRightPress={() => router.back()}
            />

            <ChatFAB onPress={() => setShowNewChatModal(true)} />

            <NewChatModal
                isVisible={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                onCreate={handleCreateChat}
            />
        </ChatBackground>
    );
}

