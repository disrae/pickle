import { ChatBackground } from "@/components/ui/Background";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@/lib/header-layout";

const MAX_WALL_MESSAGE_LENGTH = 280;
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourtWallScreen() {
    const { bottom } = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const { courtId } = useLocalSearchParams<{ courtId: string }>();
    const [draft, setDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [editingId, setEditingId] = useState<Id<"courtWallMessages"> | null>(null);
    const [inputFocused, setInputFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const currentUser = useQuery(api.users.currentUser);
    const court = useQuery(api.courts.get, courtId ? { id: courtId as Id<"courts"> } : "skip");
    const messages = useQuery(
        api.courtWall.getMessagesForCourt,
        courtId ? { courtId: courtId as Id<"courts"> } : "skip"
    );

    const postMessage = useMutation(api.courtWall.postMessage);
    const editMessage = useMutation(api.courtWall.editMessage);
    const deleteMessage = useMutation(api.courtWall.deleteMessage);

    useEffect(() => {
        if (messages && messages.length > 0) {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages?.length]);

    const formatMessageTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const canEdit = (createdAt: number) => Date.now() - createdAt <= 15 * 60 * 1000;

    const startEdit = (messageId: Id<"courtWallMessages">, text: string) => {
        setEditingId(messageId);
        setDraft(text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft("");
    };

    const handleOwnMessageActions = (
        messageId: Id<"courtWallMessages">,
        text: string,
        createdAt: number
    ) => {
        const options: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [
            { text: "Cancel", style: "cancel" },
        ];
        if (canEdit(createdAt)) {
            options.push({ text: "Edit", onPress: () => startEdit(messageId, text) });
        }
        options.push({
            text: "Delete",
            style: "destructive",
            onPress: () => {
                Alert.alert("Delete post?", "This cannot be undone.", [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await deleteMessage({ messageId });
                                if (editingId === messageId) cancelEdit();
                            } catch (error) {
                                Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete");
                            }
                        },
                    },
                ]);
            },
        });
        Alert.alert("Your post", undefined, options);
    };

    const handleSubmit = async () => {
        if (!draft.trim() || !courtId || isSending) return;

        const text = draft.trim();
        setIsSending(true);

        try {
            if (editingId) {
                await editMessage({ messageId: editingId, message: text });
                cancelEdit();
            } else {
                setDraft("");
                await postMessage({ courtId: courtId as Id<"courts">, message: text });
            }
        } catch (error) {
            if (!editingId) setDraft(text);
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to send");
        } finally {
            setIsSending(false);
        }
    };

    if (!court || messages === undefined || !currentUser) {
        return (
            <ChatBackground>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3F7D20" />
                    <Text className="text-foreground-muted mt-4">Loading court wall...</Text>
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
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4"
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16, flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-12 px-4">
                                <Ionicons name="chatbubbles-outline" size={64} color="#5c6454" />
                                <Text className="text-foreground-muted text-center mt-4 text-lg font-semibold">
                                    Court wall
                                </Text>
                                <Text className="text-foreground-muted text-center text-sm mt-2 leading-5">
                                    Post who&apos;s in, court conditions, or if you need a fourth. Everyone at{" "}
                                    {court.name} can see it here.
                                </Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                const isCurrentUser = msg.userId === currentUser._id;
                                const showDate =
                                    index === 0 ||
                                    new Date(messages[index - 1].createdAt).toDateString() !==
                                        new Date(msg.createdAt).toDateString();
                                const displayName =
                                    msg.user?.name || msg.user?.email?.split("@")[0] || "Player";

                                return (
                                    <View key={msg._id}>
                                        {showDate && (
                                            <View className="items-center my-4">
                                                <View className="bg-slate-200 rounded-full px-3 py-1">
                                                    <Text className="text-xs text-foreground-muted font-semibold">
                                                        {new Date(msg.createdAt).toDateString() ===
                                                        new Date().toDateString()
                                                            ? "Today"
                                                            : new Date(msg.createdAt).toLocaleDateString("en-US", {
                                                                  weekday: "long",
                                                                  month: "short",
                                                                  day: "numeric",
                                                              })}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        <View
                                            className={`mb-3 ${isCurrentUser ? "items-end" : "items-start"}`}
                                        >
                                            {!isCurrentUser && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        msg.user?._id &&
                                                        router.push(`/profile/${msg.user._id}`)
                                                    }
                                                    className="mb-1 ml-2"
                                                >
                                                    <Text className="text-xs text-foreground-muted">{displayName}</Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                activeOpacity={isCurrentUser ? 0.8 : 1}
                                                onLongPress={
                                                    isCurrentUser
                                                        ? () =>
                                                              handleOwnMessageActions(
                                                                  msg._id,
                                                                  msg.message,
                                                                  msg.createdAt
                                                              )
                                                        : undefined
                                                }
                                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                                    isCurrentUser
                                                        ? "bg-brand rounded-br-sm"
                                                        : "bg-surface-2 rounded-bl-sm"
                                                }`}
                                                style={{
                                                    shadowColor: "#12170F",
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 2,
                                                    elevation: 2,
                                                }}
                                            >
                                                <Text
                                                    className={`text-base ${
                                                        isCurrentUser ? "text-white" : "text-foreground"
                                                    }`}
                                                >
                                                    {msg.message}
                                                </Text>
                                                <Text
                                                    className={`text-xs mt-1 ${
                                                        isCurrentUser ? "text-lime-100" : "text-foreground-muted"
                                                    }`}
                                                >
                                                    {formatMessageTime(msg.createdAt)}
                                                    {msg.editedAt ? " · edited" : ""}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    <View
                        className="px-4 pt-3 border-t border-border bg-background/95"
                        style={{ paddingBottom: bottom + 12 }}
                    >
                        {editingId && (
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm text-brand font-semibold">Editing post</Text>
                                <TouchableOpacity onPress={cancelEdit}>
                                    <Text className="text-sm text-muted-foreground">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View className="flex-row items-end gap-2">
                            <View
                                className={`flex-1 rounded-2xl px-4 py-2 border ${
                                    inputFocused
                                        ? "border-brand bg-brand/10"
                                        : "border-border bg-surface-2"
                                }`}
                                style={{ borderCurve: "continuous" }}
                            >
                                <TextInput
                                    value={draft}
                                    onChangeText={(t) =>
                                        setDraft(t.slice(0, MAX_WALL_MESSAGE_LENGTH))
                                    }
                                    placeholder={
                                        editingId ? "Update your post..." : "Who's in? Need a fourth?"
                                    }
                                    className="text-base text-foreground max-h-24 outline-none"
                                    placeholderTextColor="#6b7563"
                                    multiline
                                    editable={!isSending}
                                    maxLength={MAX_WALL_MESSAGE_LENGTH}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    underlineColorAndroid="transparent"
                                    style={{
                                        backgroundColor: "transparent",
                                        ...(Platform.OS === "web"
                                            ? { outlineStyle: "none" as const }
                                            : {}),
                                    }}
                                />
                                <Text className="text-xs text-muted-foreground text-right mt-1">
                                    {draft.length}/{MAX_WALL_MESSAGE_LENGTH}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={!draft.trim() || isSending}
                                className="bg-brand rounded-full w-11 h-11 items-center justify-center"
                                style={{ opacity: !draft.trim() || isSending ? 0.5 : 1 }}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Ionicons
                                        name={editingId ? "checkmark" : "send"}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text className="text-xs text-muted-foreground text-center mt-2">
                            Posts clear after 48 hours
                        </Text>
                    </View>
                </View>

                <Header
                    title={`${court.name} — Court wall`}
                    rightButton="back"
                    onRightPress={() => router.back()}
                />
            </KeyboardAvoidingView>
        </ChatBackground>
    );
}
