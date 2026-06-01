import React, { useState } from "react";
import { Modal, Text, View } from "react-native";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/lib/theme-context";
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
    const { activeTheme } = useTheme();
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
            <View style={activeTheme} className="flex-1 items-center justify-center bg-black/70 px-6">
                <View
                    className="w-full max-w-md rounded-3xl border border-border bg-popover p-6"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                        {isRequired ? "Welcome!" : "Change Name"}
                    </Text>
                    <Text className="mb-6 text-center text-foreground-muted">
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
                        <Text className="mt-2 text-center text-sm text-destructive">
                            {error}
                        </Text>
                    ) : null}

                    <View className="h-6" />

                    <View className={`w-full ${!isRequired ? "flex-row gap-3" : ""}`}>
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
                            variant="brand"
                            title="Save"
                            onPress={handleSave}
                            fullWidth={isRequired}
                            className={!isRequired ? "flex-1" : ""}
                            loading={isSubmitting}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
