import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { StyledButton } from "@/components/ui/StyledButton";
import { api } from "@/convex/_generated/api";
import { useTabBarHeight } from "@/lib/tab-bar-layout";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
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

export default function CoachScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const tabBarHeight = useTabBarHeight();
    const router = useRouter();
    const messages = useQuery(api.coach.getMessages);
    const profile = useQuery(api.skillsProfiles.getForCurrentUser);
    const user = useQuery(api.users.currentUser);
    const startInterview = useMutation(api.coach.startInterview);
    const confirmProfile = useMutation(api.skillsProfiles.confirmProfile);
    const sendMessage = useAction(api.coachActions.sendMessage);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (messages !== undefined && messages.length === 0) {
            startInterview({});
        }
    }, [messages, startInterview]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setInput("");
        setSending(true);
        try {
            await sendMessage({ message: text });
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const headerHeight = top + 60;
    const showProfileConfirm = profile && !profile.confirmedAt && profile.proposedAt;

    return (
        <Background>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={headerHeight}
            >
                <ScrollView
                    ref={scrollRef}
                    className="flex-1 px-4"
                    contentContainerStyle={{
                        paddingTop: headerHeight,
                        paddingBottom: bottom + 100,
                    }}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                >
                    {user?.coachOnboardingComplete && (
                        <TouchableOpacity
                            onPress={() => router.push("/(authenticated)/(tabs)/drills")}
                            className="mb-4"
                        >
                            <GlassContainer style={{ borderRadius: 20, padding: 16 }}>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-foreground font-semibold">Browse drills</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#a3e635" />
                                </View>
                            </GlassContainer>
                        </TouchableOpacity>
                    )}

                    {showProfileConfirm && (
                        <GlassContainer style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}>
                            <Text className="text-foreground text-lg font-bold mb-2">
                                Your skills profile
                            </Text>
                            <Text className="text-muted-foreground mb-3">
                                Overall: {profile.overallLevel?.toFixed(1) ?? "—"}
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {[
                                    ["Serving", profile.serving],
                                    ["Dinking", profile.dinking],
                                    ["Volley", profile.volley],
                                    ["Footwork", profile.footwork],
                                ].map(([label, val]) => (
                                    <View key={label as string} className="bg-surface-2 px-3 py-1 rounded-full">
                                        <Text className="text-foreground text-sm">
                                            {label}: {typeof val === "number" ? val.toFixed(1) : "—"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <StyledButton
                                variant="brand"
                                title="Looks good — save profile"
                                onPress={() => confirmProfile({})}
                            />
                        </GlassContainer>
                    )}

                    {messages === undefined ? (
                        <ActivityIndicator color="#a3e635" />
                    ) : (
                        messages.map((msg) => (
                            <View
                                key={msg._id}
                                className={`mb-3 max-w-[85%] ${msg.role === "user" ? "self-end" : "self-start"}`}
                            >
                                <GlassContainer
                                    style={{
                                        borderRadius: 20,
                                        padding: 14,
                                        backgroundColor:
                                            msg.role === "user"
                                                ? "rgba(163, 230, 53, 0.15)"
                                                : undefined,
                                    }}
                                >
                                    <Text className="text-foreground leading-5">{msg.content}</Text>
                                </GlassContainer>
                            </View>
                        ))
                    )}
                    {sending && <ActivityIndicator color="#a3e635" className="mt-2" />}
                </ScrollView>

                {!user?.coachOnboardingComplete && (
                    <View
                        className="absolute left-0 right-0 px-4 border-t border-border bg-background/95"
                        style={{ bottom: tabBarHeight, paddingTop: 12, paddingBottom: 12 }}
                    >
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="flex-1 bg-surface-2 text-foreground rounded-2xl px-4 py-3"
                                placeholder="Reply to your coach..."
                                placeholderTextColor="#6b7563"
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                                editable={!sending}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={sending || !input.trim()}
                                className="bg-brand w-12 h-12 rounded-full items-center justify-center"
                            >
                                <Ionicons name="send" size={20} color="#151c0c" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>

            <Header title="Coach's Corner" />
        </Background>
    );
}
