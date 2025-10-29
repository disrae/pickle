import { LoadingScreen } from "@/components/screens/Loading";
import { api } from "@/convex/_generated/api";
import { LoadingProvider, useLoading } from '@/lib/loading-context';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useQuery } from "convex/react";
import { Stack } from "expo-router";
import Head from 'expo-router/head';
import * as SecureStore from "expo-secure-store";
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
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
        <LoadingProvider>
          <AppContent />
          <LoadingScreen />
        </LoadingProvider>
      </ConvexAuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { activeTheme } = useTheme();
  const user = useQuery(api.users.currentUser);
  const isLoadingUser = user === undefined;
  const isAuthenticated = user !== null;
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isLoadingUser) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingUser, showLoading, hideLoading]);

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