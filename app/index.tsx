import { Background } from "@/components/ui/Background";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Styled input component
export function StyledInput({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType = "default"
}: {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View className="w-full">
      <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base"
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

// Styled button component
function StyledButton({ onPress, title }: { onPress: () => void; title: string; }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-lime-500 rounded-xl py-4 w-full active:bg-lime-600"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text className="text-white text-center text-base font-bold">
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const { top } = useSafeAreaInsets();
  const { signIn } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  console.log("user", user);
  const [email, setEmail] = useState("");

  const handleSendLoginLink = async () => {
    if (!email.trim()) return;

    try {
      await signIn("resend-otp", {
        email: email.trim().toLowerCase(),
        // redirectTo: "https://jpickle.win/auth/verify"
      });
      alert("Check your email! We sent you a magic link to sign in.");
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Failed to send email. Please try again.");
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-lime-400"
    >
      <Background>
        <Pressable className="flex-1" onPress={() => Keyboard.dismiss()}>
          <View
            className="flex-1 items-center gap-4"
            style={{ paddingTop: top }}
          >
            {/* Login Form */}
            <View className="flex-1 px-6 w-full max-w-md top-[25%] self-center">
              <View
                className="bg-white/95 px-6 py-8 w-full rounded-3xl"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
                  Welcome Back
                </Text>
                <Text className="text-slate-500 text-center mb-8">
                  Sign in to continue
                </Text>

                <StyledInput
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <View className="h-8" />

                <StyledButton onPress={handleSendLoginLink} title="Send login link" />
              </View>
            </View>
          </View>
        </Pressable>
      </Background>
    </KeyboardAvoidingView>
  );
}
