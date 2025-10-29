import React, { useState } from "react";
import { Modal, Text, View, ActivityIndicator } from "react-native";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

interface SetNamePopupProps {
    isVisible: boolean;
    onClose: () => void;
    currentName?: string;
    isRequired?: boolean; // If true, popup can't be dismissed
}

export const SetNamePopup = ({ 
    isVisible, 
    onClose, 
    currentName = "",
    isRequired = false 
}: SetNamePopupProps) => {
    const [name, setName] = useState(currentName);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateName = useMutation(api.users.updateName);

    const validateName = (value: string): boolean => {
        const trimmed = value.trim();
        
        if (trimmed.length < 2) {
            setError("Name must be at least 2 characters");
            return false;
        }
        
        // Check if name contains at least one letter
        if (!/[a-zA-Z]/.test(trimmed)) {
            setError("Name must contain at least one letter");
            return false;
        }
        
        setError("");
        return true;
    };

    const handleSave = async () => {
        if (!validateName(name)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await updateName({ name: name.trim() });
            setError("");
            onClose();
        } catch (err) {
            console.error("Error updating name:", err);
            setError("Failed to update name. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!isRequired) {
            setError("");
            setName(currentName);
            onClose();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={isRequired ? undefined : handleCancel}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View
                    className="bg-white/95 p-6 rounded-3xl w-4/5 max-w-md"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                        {isRequired ? "Welcome!" : "Change Name"}
                    </Text>
                    <Text className="text-slate-600 text-center mb-6">
                        {isRequired 
                            ? "Please set your display name to continue" 
                            : "Update your display name"}
                    </Text>

                    <StyledInput
                        label="Display Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            setError("");
                        }}
                        autoFocus={true}
                    />

                    {error ? (
                        <Text className="text-red-500 text-sm mt-2 text-center">
                            {error}
                        </Text>
                    ) : null}

                    <View className="h-6" />

                    <View className={`w-full ${!isRequired ? "flex-row space-x-4" : ""}`}>
                        {!isRequired && (
                            <StyledButton
                                variant="secondary"
                                title="Cancel"
                                onPress={handleCancel}
                                fullWidth={false}
                                className="flex-1"
                            />
                        )}
                        <StyledButton
                            variant="primary"
                            title={isSubmitting ? "" : "Save"}
                            onPress={handleSave}
                            fullWidth={isRequired}
                            className={!isRequired ? "flex-1" : ""}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <ActivityIndicator color="white" />}
                        </StyledButton>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

