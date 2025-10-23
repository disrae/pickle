import { Text, TextInput, TouchableOpacity, View } from "react-native";
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
export function StyledInput({ label, placeholder, secureTextEntry }: {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View className="w-full">
      <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
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

  const handleLogin = () => {
    console.log('Login pressed');
  };

  return (
    <View
      className="bg-lime-400 flex-1 items-center gap-4"
      style={{ paddingTop: top }}
    >
      {/* Pickleball hole pattern */}
      <View className="absolute inset-0 overflow-hidden">
        <PickleballHoles />
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
            label="Username"
            placeholder="Enter your username"
          />

          <View className="h-5" />

          <StyledInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
          />

          <View className="h-8" />

          <StyledButton onPress={handleLogin} title="Sign In" />
        </View>
      </View>
    </View>
  );
}
