import { Background } from "@/components/ui/Background";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledInput } from "@/components/ui/StyledInput";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
                  Jericho Pickle
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
