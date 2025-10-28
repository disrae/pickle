import { api } from "@/convex/_generated/api";
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useQuery } from "convex/react";
import { Stack, usePathname } from "expo-router";
import Head from 'expo-router/head';
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Platform, View } from 'react-native';
import '../global.css';

// Wrap SecureStore methods to handle errors gracefully
const secureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const pathname = usePathname();
  console.log("pathname", pathname);
  return (

    <ThemeProvider defaultTheme="system">
      <ConvexAuthProvider
        client={convex}
        storage={
          Platform.OS === "android" || Platform.OS === "ios"
            ? secureStorage
            : undefined
        }>
        <Head>
          <meta name="apple-itunes-app" content="app-id=6754373389" />
        </Head>
        <AppContent />
      </ConvexAuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { activeTheme } = useTheme();
  const user = useQuery(api.users.currentUser);
  const isLoading = user === undefined;
  const isAuthenticated = user !== null;

  if (isLoading) {
    return (
      <View style={activeTheme} className="flex-1 items-center justify-center bg-lime-400">
        <ActivityIndicator size="large" color="#65a30d" />
      </View>
    );
  }

  return (
    <View style={activeTheme} className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(authenticated)" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}