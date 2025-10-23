import { useAuthActions } from "@convex-dev/auth/react";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Pickleball hole pattern component
function PickleballHoles() {
  const holes = [];
  const holeSize = 40;
  const spacing = 70;

  // Create diagonal pattern of holes - extended for wider screens
  for (let row = -2; row < 25; row++) {
    for (let col = -2; col < 30; col++) {
      const x = col * spacing + (row % 2) * (spacing / 2);
      const y = row * spacing;

      holes.push(
        <View
          key={`hole-${row}-${col}`}
          className="bg-lime-500/60 rounded-full absolute"
          style={{
            width: holeSize,
            height: holeSize,
            left: x,
            top: y,
          }}
        />
      );
    }
  }

  return <>{holes}</>;
}

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
  const [email, setEmail] = useState("danny.israel@gmail.com");

  const handleSendLoginLink = async () => {
    if (!email.trim()) return;

    try {
      await signIn("resend-otp", {
        email: email.trim().toLowerCase(),
        redirectTo: "https://jpickle.win/auth/verify"
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
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          className="bg-lime-400 flex-1 items-center gap-4"
          style={{ paddingTop: top }}
        >
          {/* Pickleball hole pattern */}
          <View className="absolute inset-0 overflow-hidden">
            <PickleballHoles />
          </View>

          {/* Vignette overlay - darker edges */}
          <View className="absolute inset-0 pointer-events-none">
            {/* Top shadow */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent']}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 150,
              }}
            />
            {/* Bottom shadow */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 150,
              }}
            />
            {/* Left shadow */}
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 60,
              }}
            />
            {/* Right shadow */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 60,
              }}
            />
          </View>

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
