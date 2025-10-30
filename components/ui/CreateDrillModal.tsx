import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface CreateDrillModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const CATEGORIES = ["Serving", "Dinking", "Drop Shot", "Reset", "Volley", "Footwork"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const METRIC_TYPES = [
    { value: "consecutive", label: "Consecutive" },
    { value: "time", label: "Time (minutes)" },
    { value: "accuracy_percentage", label: "Accuracy %" },
    { value: "total_count", label: "Total Count" },
];

export function CreateDrillModal({ isVisible, onClose }: CreateDrillModalProps) {
    const createDrill = useMutation(api.drills.create);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [tags, setTags] = useState("");
    const [metricType, setMetricType] = useState("");
    const [metricDescription, setMetricDescription] = useState("");
    const [milestones, setMilestones] = useState([
        { count: "", description: "" },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("");
        setDifficulty("");
        setTags("");
        setMetricType("");
        setMetricDescription("");
        setMilestones([{ count: "", description: "" }]);
        setError("");
    };

    const handleAddMilestone = () => {
        setMilestones([...milestones, { count: "", description: "" }]);
    };

    const handleRemoveMilestone = (index: number) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((_, i) => i !== index));
        }
    };

    const handleMilestoneChange = (
        index: number,
        field: "count" | "description",
        value: string
    ) => {
        const updated = [...milestones];
        updated[index][field] = value;
        setMilestones(updated);
    };

    const handleSubmit = async () => {
        setError("");

        // Validation
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!description.trim()) {
            setError("Description is required");
            return;
        }
        if (!category) {
            setError("Please select a category");
            return;
        }
        if (!difficulty) {
            setError("Please select a difficulty");
            return;
        }
        if (!metricType) {
            setError("Please select a metric type");
            return;
        }
        if (!metricDescription.trim()) {
            setError("Metric description is required");
            return;
        }

        // Validate milestones
        const validMilestones = milestones.filter(
            (m) => m.count.trim() !== "" && m.description.trim() !== ""
        );
        if (validMilestones.length === 0) {
            setError("At least one milestone is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const parsedMilestones = validMilestones.map((m) => ({
                count: parseInt(m.count, 10),
                description: m.description.trim(),
            }));

            const tagArray = tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t !== "");

            await createDrill({
                title: title.trim(),
                description: description.trim(),
                category,
                difficulty,
                tags: tagArray,
                milestones: parsedMilestones,
                metricType,
                metricDescription: metricDescription.trim(),
            });

            resetForm();
            onClose();
        } catch (err) {
            setError("Failed to create drill. Please try again.");
            console.error("Create drill error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-[90%]">
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-6 pb-4 border-b border-slate-200">
                            <Text className="text-2xl font-bold text-slate-800">
                                Create Drill
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                className="bg-slate-100 rounded-full p-2"
                            >
                                <Ionicons name="close" size={24} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4">
                            {/* Error Message */}
                            {error && (
                                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                    <Text className="text-red-700 text-sm">{error}</Text>
                                </View>
                            )}

                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Title *
                                </Text>
                                <TextInput
                                    className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., Deep Serve Mastery"
                                    value={title}
                                    onChangeText={setTitle}
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Description *
                                </Text>
                                <TextInput
                                    className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="Describe the drill and its objectives..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Category */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Category *
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setCategory(cat)}
                                            disabled={isSubmitting}
                                            className={`rounded-full px-4 py-2 mr-2 mb-2 ${category === cat ? "bg-lime-500" : "bg-slate-100"}`}
                                        >
                                            <Text
                                                className={`font-medium ${category === cat ? "text-white" : "text-slate-700"}`}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Difficulty */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Difficulty *
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {DIFFICULTIES.map((diff) => (
                                        <TouchableOpacity
                                            key={diff}
                                            onPress={() => setDifficulty(diff)}
                                            disabled={isSubmitting}
                                            className={`rounded-full px-4 py-2 mr-2 mb-2 ${difficulty === diff ? "bg-lime-500" : "bg-slate-100"}`}
                                        >
                                            <Text
                                                className={`font-medium ${difficulty === diff ? "text-white" : "text-slate-700"}`}
                                            >
                                                {diff}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Tags */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Tags (comma-separated)
                                </Text>
                                <TextInput
                                    className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., serve, accuracy, technique"
                                    value={tags}
                                    onChangeText={setTags}
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Metric Type */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Metric Type *
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {METRIC_TYPES.map((metric) => (
                                        <TouchableOpacity
                                            key={metric.value}
                                            onPress={() => setMetricType(metric.value)}
                                            disabled={isSubmitting}
                                            className={`rounded-full px-4 py-2 mr-2 mb-2 ${metricType === metric.value ? "bg-lime-500" : "bg-slate-100"}`}
                                        >
                                            <Text
                                                className={`font-medium ${metricType === metric.value ? "text-white" : "text-slate-700"}`}
                                            >
                                                {metric.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Metric Description */}
                            <View className="mb-4">
                                <Text className="text-slate-700 font-semibold mb-2">
                                    Metric Description *
                                </Text>
                                <TextInput
                                    className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., Consecutive successful serves"
                                    value={metricDescription}
                                    onChangeText={setMetricDescription}
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Milestones */}
                            <View className="mb-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-slate-700 font-semibold">
                                        Milestones *
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleAddMilestone}
                                        disabled={isSubmitting}
                                        className="bg-lime-100 rounded-full p-2"
                                    >
                                        <Ionicons name="add" size={20} color="#65a30d" />
                                    </TouchableOpacity>
                                </View>
                                {milestones.map((milestone, index) => (
                                    <View
                                        key={index}
                                        className="flex-row items-center mb-2"
                                    >
                                        <TextInput
                                            className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 w-20 mr-2"
                                            placeholder="Count"
                                            keyboardType="numeric"
                                            value={milestone.count}
                                            onChangeText={(value) =>
                                                handleMilestoneChange(index, "count", value)
                                            }
                                            editable={!isSubmitting}
                                        />
                                        <TextInput
                                            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 mr-2"
                                            placeholder="Description (e.g., '5 in a row')"
                                            value={milestone.description}
                                            onChangeText={(value) =>
                                                handleMilestoneChange(index, "description", value)
                                            }
                                            editable={!isSubmitting}
                                        />
                                        {milestones.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => handleRemoveMilestone(index)}
                                                disabled={isSubmitting}
                                                className="bg-red-100 rounded-full p-2"
                                            >
                                                <Ionicons name="trash" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className={`rounded-xl py-4 items-center mb-6 ${isSubmitting ? "bg-slate-300" : "bg-lime-500"}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">
                                        Create Drill
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

