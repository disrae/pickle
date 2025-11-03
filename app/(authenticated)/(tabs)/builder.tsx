import { Background } from "@/components/ui/Background";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["Gameplay", "Social", "Training", "UI/UX", "Other"];

export default function BuilderScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Gameplay");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const features = useQuery(api.featureRequests.list);
    const createFeature = useMutation(api.featureRequests.create);

    // Get current user
    const user = useQuery(api.users.currentUser);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await createFeature({
                title: title.trim(),
                description: description.trim(),
                category: selectedCategory,
            });
            // Reset form
            setTitle("");
            setDescription("");
            setSelectedCategory("Gameplay");
            setShowSubmitForm(false);
        } catch (error) {
            console.error("Submit feature error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerHeight = top + 100;

    // Sort features by vote count (highest first)
    const sortedFeatures = features ? [...features].sort((a, b) => b.voteCount - a.voteCount) : [];

    return (
        <Background>
            {/* <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={headerHeight}
            > */}
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: Math.max(bottom, 32) + (isLiquidGlassAvailable() ? 30 : 20)
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Section */}
                <GlassContainer
                    style={{
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 16,
                    }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bulb" size={20} color="#84cc16" />
                        <Text className="text-slate-300 text-sm ml-2 flex-1">
                            Vote for features or submit your own ideas
                        </Text>
                    </View>
                </GlassContainer>

                {/* Features List */}
                {!features ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#84cc16" />
                    </View>
                ) : sortedFeatures.length > 0 ? (
                    sortedFeatures.map((feature) => (
                        <FeatureCard key={feature._id} feature={feature} />
                    ))
                ) : (
                    <GlassContainer
                        style={{
                            borderRadius: 16,
                            padding: 24,
                        }}
                    >
                        <View className="items-center">
                            <Ionicons name="rocket-outline" size={48} color="#cbd5e1" />
                            <Text className="text-slate-300 text-center mt-4">
                                No features yet. Be the first to suggest one!
                            </Text>
                        </View>
                    </GlassContainer>
                )}

                {/* Submit Form */}
                {showSubmitForm && (
                    <GlassContainer
                        style={{
                            borderRadius: 20,
                            padding: 20,
                            marginTop: 16,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-slate-200">
                                Suggest a Feature
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowSubmitForm(false)}
                                className="p-1"
                            >
                                <Ionicons name="close-circle" size={28} color="#ef4444" />
                            </TouchableOpacity>
                        </View>

                        {/* Title Input */}
                        <Text className="text-slate-300 text-sm font-semibold mb-2">
                            Title
                        </Text>
                        <TextInput
                            className="bg-slate-700/60 rounded-xl px-4 py-3 text-slate-200 mb-4 border border-slate-600"
                            placeholder="Brief title for your feature..."
                            placeholderTextColor="#94a3b8"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />

                        {/* Description Input */}
                        <Text className="text-slate-300 text-sm font-semibold mb-2">
                            Description
                        </Text>
                        <TextInput
                            className="bg-slate-700/60 rounded-xl px-4 py-3 text-slate-200 mb-4 border border-slate-600"
                            placeholder="Describe your feature idea..."
                            placeholderTextColor="#94a3b8"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                            textAlignVertical="top"
                        />

                        {/* Category Selector */}
                        <Text className="text-slate-300 text-sm font-semibold mb-2">
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
                                    className={`rounded-full px-4 py-2 mr-2 border ${selectedCategory === category
                                        ? "bg-lime-400 border-lime-300"
                                        : "bg-slate-700/60 border-slate-600"
                                        }`}
                                >
                                    <Text
                                        className={`font-semibold ${selectedCategory === category
                                            ? "text-black"
                                            : "text-slate-300"
                                            }`}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Submit Button */}
                        <Button
                            onPress={handleSubmit}
                            disabled={isSubmitting || !title.trim() || !description.trim()}
                            className="bg-lime-500"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="white" />
                                    <Text className="text-white text-base font-semibold ml-2">
                                        Submit Feature
                                    </Text>
                                </>
                            )}
                        </Button>
                    </GlassContainer>
                )}

                {/* Add Feature Button (when form is hidden) */}
                {!showSubmitForm && (
                    <TouchableOpacity
                        onPress={() => setShowSubmitForm(true)}
                        className="mt-4 mb-8"
                        activeOpacity={0.7}
                    >
                        <GlassContainer
                            style={{
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="add-circle" size={24} color="#84cc16" />
                                <Text className="text-lime-400 text-base font-semibold ml-2">
                                    Suggest Your Own Feature
                                </Text>
                            </View>
                        </GlassContainer>
                    </TouchableOpacity>
                )}
            </ScrollView>
            {/* {isLiquidGlassAvailable() && <View className="h-10" />} */}
            {/* </KeyboardAvoidingView> */}

            <Header
                title="Builder"
                titleSize="text-2xl"
                rightButton="chat"
                onRightPress={() => router.push("/builder/chats")}
                user={user}
            />
        </Background>
    );
}

