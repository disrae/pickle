import { useEffect, useState } from "react";
import { View } from "react-native";

export function TypingIndicator() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setActive((n) => (n + 1) % 3), 400);
        return () => clearInterval(id);
    }, []);

    return (
        <View className="flex-row items-center gap-1.5 py-0.5">
            {[0, 1, 2].map((i) => (
                <View
                    key={i}
                    className="rounded-full bg-muted-foreground"
                    style={{
                        width: 7,
                        height: 7,
                        opacity: active === i ? 1 : 0.35,
                        transform: [{ scale: active === i ? 1.2 : 1 }],
                    }}
                />
            ))}
        </View>
    );
}
