import { ChatBackground } from "@/components/ui/Background";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingChatScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const currentUser = useQuery(api.users.currentUser);
    const chat = useQuery(
        api.trainingChats.get,
        chatId ? { chatId: chatId as Id<"trainingChats"> } : "skip"
    );
    const messages = useQuery(
        api.trainingChatMessages.list,
        chatId ? { chatId: chatId as Id<"trainingChats"> } : "skip"
    );

    const sendMessage = useMutation(api.trainingChatMessages.send);
    const toggleNotifications = useMutation(api.trainingChats.toggleNotifications);

    const handleToggleNotifications = async () => {
        if (!chatId) return;
        try {
            await toggleNotifications({ chatId: chatId as Id<"trainingChats"> });
        } catch (error) {
            console.error("Error toggling notifications:", error);
        }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages?.length]);

    const handleSend = async () => {
        if (!message.trim() || !chatId || isSending) return;

        const messageToSend = message.trim();
        setMessage("");
        setIsSending(true);

        try {
            await sendMessage({
                chatId: chatId as Id<"trainingChats">,
                message: messageToSend,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessage(messageToSend);
        } finally {
            setIsSending(false);
        }
    };

    const formatMessageTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isYesterday) {
            return (
                "Yesterday " +
                date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const headerHeight = top + 60;

    if (!chat || !messages || !currentUser) {
        return (
            <ChatBackground>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#a3e635" />
                    <Text className="text-slate-600 mt-4">Loading chat...</Text>
                </View>
            </ChatBackground>
        );
    }

    return (
        <ChatBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                <View className="flex-1" style={{ paddingTop: headerHeight }}>
                    {/* Chat Description & Notification Toggle */}
                    <View className="px-4 py-3 bg-slate-100/80">
                        {chat.description && (
                            <Text className="text-sm text-slate-600 text-center mb-2">
                                {chat.description}
                            </Text>
                        )}
                        <TouchableOpacity
                            onPress={handleToggleNotifications}
                            className="flex-row items-center justify-center py-2"
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={chat.notifyOnNewMessage ? "notifications" : "notifications-off-outline"}
                                size={18}
                                color={chat.notifyOnNewMessage ? "#84cc16" : "#94a3b8"}
                            />
                            <Text
                                className={`text-sm ml-2 ${
                                    chat.notifyOnNewMessage ? "text-lime-600 font-semibold" : "text-slate-500"
                                }`}
                            >
                                {chat.notifyOnNewMessage
                                    ? "Notifications enabled"
                                    : "Enable notifications"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4"
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                    >
                        {messages.length === 0 ? (
                            <View className="items-center justify-center py-12">
                                <Ionicons name="chatbubble-outline" size={64} color="#cbd5e1" />
                                <Text className="text-slate-400 text-center mt-4 text-lg">
                                    No messages yet
                                </Text>
                                <Text className="text-slate-400 text-center text-sm mt-2">
                                    Start the conversation!
                                </Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                const isCurrentUser = msg.userId === currentUser._id;
                                const showDate =
                                    index === 0 ||
                                    new Date(messages[index - 1].createdAt).toDateString() !==
                                        new Date(msg.createdAt).toDateString();

                                return (
                                    <View key={msg._id}>
                                        {showDate && (
                                            <View className="items-center my-4">
                                                <View className="bg-slate-200 rounded-full px-3 py-1">
                                                    <Text className="text-xs text-slate-600 font-semibold">
                                                        {new Date(msg.createdAt).toDateString() ===
                                                        new Date().toDateString()
                                                            ? "Today"
                                                            : new Date(
                                                                  msg.createdAt
                                                              ).toLocaleDateString("en-US", {
                                                                  weekday: "long",
                                                                  month: "short",
                                                                  day: "numeric",
                                                              })}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        <View
                                            className={`mb-3 ${
                                                isCurrentUser ? "items-end" : "items-start"
                                            }`}
                                        >
                                            {!isCurrentUser && (
                                                <Text className="text-xs text-slate-500 mb-1 ml-2">
                                                    {msg.user?.name || msg.user?.email || "Unknown"}
                                                </Text>
                                            )}
                                            <View
                                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                                    isCurrentUser
                                                        ? "bg-lime-500 rounded-br-sm"
                                                        : "bg-white/95 rounded-bl-sm"
                                                }`}
                                                style={{
                                                    shadowColor: "#000",
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 2,
                                                    elevation: 2,
                                                }}
                                            >
                                                <Text
                                                    className={`text-base ${
                                                        isCurrentUser
                                                            ? "text-white"
                                                            : "text-slate-800"
                                                    }`}
                                                >
                                                    {msg.message}
                                                </Text>
                                                <Text
                                                    className={`text-xs mt-1 ${
                                                        isCurrentUser
                                                            ? "text-lime-100"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {formatMessageTime(msg.createdAt)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Message Input */}
                    <View
                        className="px-4 py-3 bg-white/95 border-t border-slate-200"
                        style={{ paddingBottom: bottom + 12 }}
                    >
                        <View className="flex-row items-end gap-2">
                            <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-2">
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Type a message..."
                                    className="text-base text-slate-800 max-h-24"
                                    placeholderTextColor="#64748b"
                                    multiline
                                    editable={!isSending}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!message.trim() || isSending}
                                className="bg-lime-500 rounded-full w-10 h-10 items-center justify-center"
                                style={{
                                    opacity: !message.trim() || isSending ? 0.5 : 1,
                                }}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="send" size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Header
                    title={chat.title}
                    rightButton="back"
                    onRightPress={() => router.back()}
                    user={currentUser}
                />
            </KeyboardAvoidingView>
        </ChatBackground>
    );
}

