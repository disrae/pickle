import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

interface ChatFABProps {
    onPress: () => void;
}

export function ChatFAB({ onPress }: ChatFABProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="absolute bottom-8 right-8 bg-blue-500 rounded-full w-16 h-16 items-center justify-center shadow-lg"
            activeOpacity={0.8}
            style={{
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
            }}
        >
            <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
    );
}

