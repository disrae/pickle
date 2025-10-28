import React from "react";
import { Modal, Text, View } from "react-native";

import { StyledButton } from "@/components/ui/StyledButton";

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
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View
                    className="bg-white/95 p-6 rounded-3xl w-4/5 max-w-md items-center"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    {title && (
                        <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">
                            {title}
                        </Text>
                    )}
                    <Text className="text-slate-600 text-center mb-6">{message}</Text>
                    <View className={`w-full ${onConfirm ? "flex-row space-x-4" : ""}`}>
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
