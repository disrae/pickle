import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface NewChatModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCreate: (title: string, description?: string) => Promise<void>;
}

export function NewChatModal({ isVisible, onClose, onCreate }: NewChatModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            return;
        }

        setIsCreating(true);
        try {
            await onCreate(title.trim(), description.trim() || undefined);
            setTitle("");
            setDescription("");
            onClose();
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 bg-black/50 justify-center items-center px-6">
                        <TouchableWithoutFeedback>
                            <ScrollView
                                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="bg-white rounded-3xl p-6 w-full max-w-md" style={{ minWidth: 320 }}>
                                    <View className="flex-row items-center justify-between mb-6">
                                        <Text className="text-2xl font-bold text-slate-800">New Chat</Text>
                                        <TouchableOpacity onPress={handleClose} disabled={isCreating}>
                                            <Ionicons name="close" size={28} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-slate-700 mb-2">
                                            Title <Text className="text-red-500">*</Text>
                                        </Text>
                                        <TextInput
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="Enter chat title"
                                            className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-base"
                                            placeholderTextColor="#94a3b8"
                                            editable={!isCreating}
                                            returnKeyType="next"
                                        />
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-sm font-semibold text-slate-700 mb-2">
                                            Description (Optional)
                                        </Text>
                                        <TextInput
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Enter description"
                                            multiline
                                            numberOfLines={3}
                                            className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-base"
                                            placeholderTextColor="#94a3b8"
                                            style={{ minHeight: 80, textAlignVertical: "top" }}
                                            editable={!isCreating}
                                            blurOnSubmit
                                        />
                                    </View>

                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={handleClose}
                                            className="flex-1 bg-slate-100 rounded-xl py-3 items-center"
                                            disabled={isCreating}
                                        >
                                            <Text className="text-slate-700 font-semibold text-base">Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleCreate}
                                            className="flex-1 bg-lime-500 rounded-xl py-3 items-center"
                                            disabled={!title.trim() || isCreating}
                                            style={{ opacity: !title.trim() || isCreating ? 0.5 : 1 }}
                                        >
                                            {isCreating ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text className="text-white font-bold text-base">Create</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

