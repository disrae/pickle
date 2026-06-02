import { ProposedSkillsCompact } from "@/components/coach/ProposedSkillsCompact";
import { TypingIndicator } from "@/components/coach/TypingIndicator";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { stripProfileFromCoachMessage } from "@/lib/coach-message";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { useCoachChatComposerBottomInset } from "@/lib/tab-bar-layout";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type DisplayMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    optimistic?: boolean;
};

type CoachChatViewProps = {
    headerHeight: number;
};

export function CoachChatView({ headerHeight }: CoachChatViewProps) {
    const router = useRouter();
    const composerBottomInset = useCoachChatComposerBottomInset();
    const messages = useQuery(api.coach.getMessages);
    const profile = useQuery(api.skillsProfiles.getForCurrentUser);
    const startInterview = useMutation(api.coach.startInterview);
    const confirmProfile = useMutation(api.skillsProfiles.confirmProfile);
    const sendMessage = useAction(api.coachActions.sendMessage);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [pending, setPending] = useState<DisplayMessage[]>([]);
    const scrollRef = useRef<ScrollView>(null);
    const messageCountAtSend = useRef(0);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const showSub = Keyboard.addListener(showEvent, () => {
            setKeyboardVisible(true);
            requestAnimationFrame(() =>
                scrollRef.current?.scrollToEnd({ animated: true })
            );
        });
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (messages !== undefined && messages.length === 0) {
            startInterview({});
        }
    }, [messages, startInterview]);

    useEffect(() => {
        if (!messages?.length || pending.length === 0) return;
        const hasTyping = pending.some((m) => m.id === "typing");
        if (!hasTyping) return;
        if (messages.length < messageCountAtSend.current + 2) return;

        const last = messages[messages.length - 1];
        const prev = messages[messages.length - 2];
        if (last.role === "assistant" && prev?.role === "user") {
            setPending([]);
            setSending(false);
        }
    }, [messages, pending]);

    const displayMessages = useMemo((): DisplayMessage[] | undefined => {
        if (messages === undefined) return undefined;

        const server: DisplayMessage[] = messages.map((m) => ({
            id: m._id,
            role: m.role as "user" | "assistant",
            content:
                m.role === "assistant"
                    ? stripProfileFromCoachMessage(m.content)
                    : m.content,
        }));

        const serverUserContents = messages
            .filter((m) => m.role === "user")
            .map((m) => m.content);

        const outstanding = pending.filter((p) => {
            if (p.role !== "user") return true;
            const idx = serverUserContents.indexOf(p.content);
            if (idx === -1) return true;
            serverUserContents.splice(idx, 1);
            return false;
        });

        return [...server, ...outstanding];
    }, [messages, pending]);

    const showProposal =
        profile && !profile.confirmedAt && profile.proposedAt;

    useEffect(() => {
        if (!displayMessages?.length) return;
        requestAnimationFrame(() =>
            scrollRef.current?.scrollToEnd({ animated: true })
        );
    }, [displayMessages?.length, pending.length, showProposal]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        messageCountAtSend.current = messages?.length ?? 0;
        setInput("");
        setSending(true);
        setPending([
            { id: `user-${Date.now()}`, role: "user", content: text, optimistic: true },
            { id: "typing", role: "assistant", content: "", optimistic: true },
        ]);
        try {
            await sendMessage({ message: text });
        } catch (e) {
            console.error(e);
            setPending((p) => p.filter((m) => m.id !== "typing"));
            setInput(text);
            setSending(false);
        }
    };

    const composerBottomPadding = keyboardVisible ? 12 : composerBottomInset;

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
        >
            <ScrollView
                ref={scrollRef}
                className="flex-1 px-4"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: 16,
                }}
                onContentSizeChange={() =>
                    scrollRef.current?.scrollToEnd({ animated: true })
                }
            >
                {displayMessages === undefined ? (
                    <ActivityIndicator color="#3F7D20" />
                ) : (
                    displayMessages.map((msg) => (
                        <View
                            key={msg.id}
                            className={`mb-3 max-w-[85%] ${msg.role === "user" ? "self-end" : "self-start"}`}
                            style={msg.optimistic ? { opacity: 0.85 } : undefined}
                        >
                            <GlassContainer
                                style={{
                                    borderRadius: 20,
                                    padding: 14,
                                    backgroundColor:
                                        msg.role === "user"
                                            ? "rgba(63, 125, 32, 0.15)"
                                            : undefined,
                                }}
                            >
                                {msg.id === "typing" ? (
                                    <TypingIndicator />
                                ) : (
                                    <Text className="text-foreground leading-5">{msg.content}</Text>
                                )}
                            </GlassContainer>
                        </View>
                    ))
                )}

                {showProposal && (
                    <ProposedSkillsCompact
                        profile={profile}
                        confirming={confirming}
                        onConfirm={async () => {
                            setConfirming(true);
                            try {
                                await confirmProfile({});
                                router.replace("/(authenticated)/(tabs)/coach");
                            } finally {
                                setConfirming(false);
                            }
                        }}
                    />
                )}
            </ScrollView>

            <View
                className="px-4 border-t border-border bg-background/95"
                style={{ paddingTop: 12, paddingBottom: composerBottomPadding }}
            >
                <View className="flex-row items-center gap-2">
                    <TextInput
                        className="flex-1 bg-surface-2 text-foreground rounded-2xl px-4 py-3"
                        placeholder="Reply to your coach..."
                        placeholderTextColor="#c4c9bd"
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                        editable
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !input.trim()}
                        className="bg-brand w-12 h-12 rounded-full items-center justify-center"
                    >
                        <Ionicons name="send" size={20} color="#f7fbf0" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
