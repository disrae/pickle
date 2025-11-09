import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BottomSheetCard } from "./BottomSheetCard";

interface CreateFeatureCardProps {
    isVisible: boolean;
    onClose: () => void;
}

const CATEGORIES = ["Gameplay", "Social", "Training", "UI/UX", "Other"];

export function CreateFeatureCard({ isVisible, onClose }: CreateFeatureCardProps) {
    const createFeature = useMutation(api.featureRequests.create);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Gameplay");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedCategory("Gameplay");
        setError("");
    };

    const handleSubmit = async () => {
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!description.trim()) {
            setError("Description is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await createFeature({
                title: title.trim(),
                description: description.trim(),
                category: selectedCategory,
            });

            resetForm();
            onClose();
        } catch (err) {
            setError("Failed to submit feature request. Please try again.");
            console.error("Submit feature error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BottomSheetCard isVisible={isVisible} onClose={handleClose} maxHeight="70%">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 pb-4 border-b border-slate-200">
                <Text className="text-2xl font-bold text-slate-800">
                    Suggest a Feature
                </Text>
                <TouchableOpacity
                    onPress={handleClose}
                    className="bg-slate-100 rounded-full p-2"
                >
                    <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
            </View>

            <ScrollView className="px-6 py-4" style={{ maxHeight: "100%" }}>
                {/* Error Message */}
                {error && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <Text className="text-red-700 text-sm">{error}</Text>
                    </View>
                )}

                {/* Title Input */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-semibold mb-2">
                        Title *
                    </Text>
                    <TextInput
                        className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                        placeholder="Brief title for your feature..."
                        placeholderTextColor="#64748b"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                        editable={!isSubmitting}
                    />
                </View>

                {/* Description Input */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-semibold mb-2">
                        Description *
                    </Text>
                    <TextInput
                        className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                        placeholder="Describe your feature idea..."
                        placeholderTextColor="#64748b"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        maxLength={500}
                        editable={!isSubmitting}
                    />
                </View>

                {/* Category Selector */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-semibold mb-2">
                        Category
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                    >
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                                disabled={isSubmitting}
                                className={`rounded-full px-4 py-2 mr-2 border ${selectedCategory === category
                                    ? "bg-lime-500 border-lime-300"
                                    : "bg-slate-100 border-slate-300"
                                    }`}
                            >
                                <Text
                                    className={`font-semibold ${selectedCategory === category
                                        ? "text-white"
                                        : "text-slate-700"
                                        }`}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className={`rounded-xl py-4 items-center mb-6 ${
                        isSubmitting || !title.trim() || !description.trim()
                            ? "bg-slate-300"
                            : "bg-lime-500"
                    }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="send" size={20} color="white" />
                            <Text className="text-white text-base font-semibold ml-2">
                                Submit Feature
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetCard>
    );
}
