import React from "react";
import { Modal, Text, View } from "react-native";

import { StyledButton } from "@/components/ui/StyledButton";
import { useTheme } from "@/lib/theme-context";

interface PopupProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    buttonText?: string;
    onConfirm?: () => Promise<void> | void;
    confirmText?: string;
}

export const Popup = ({ isVisible, onClose, title, message, buttonText = "OK", onConfirm, confirmText }: PopupProps) => {
    const { activeTheme } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={activeTheme} className="flex-1 items-center justify-center bg-black/70 px-6">
                <View
                    className="w-full max-w-md items-center rounded-3xl border border-border bg-popover p-6"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    {title && (
                        <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                            {title}
                        </Text>
                    )}
                    <Text className="mb-6 text-center text-foreground-muted">{message}</Text>
                    <View className={`w-full ${onConfirm ? "flex-row gap-3" : ""}`}>
                        {onConfirm ? (
                            <>
                                <StyledButton
                                    variant="secondary"
                                    title="Cancel"
                                    onPress={onClose}
                                    fullWidth={false}
                                    className="flex-1"
                                />
                                <StyledButton
                                    variant="destructive"
                                    title={confirmText ?? "Confirm"}
                                    onPress={async () => {
                                        await onConfirm();
                                        onClose();
                                    }}
                                    fullWidth={false}
                                    className="flex-1"
                                />
                            </>
                        ) : (
                            <StyledButton
                                variant="primary"
                                title={buttonText ?? "OK"}
                                onPress={onClose}
                                fullWidth={true}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
