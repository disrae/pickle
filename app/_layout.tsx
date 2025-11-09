import { LoadingScreen } from "@/components/screens/Loading";
import { UpdateToast } from "@/components/ui/UpdateToast";
import { api } from "@/convex/_generated/api";
import { LoadingProvider } from '@/lib/loading-context';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { UpdatesProvider, useUpdatesContext } from '@/lib/updates-context';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useQuery } from "convex/react";
import { Stack } from "expo-router";
import Head from 'expo-router/head';
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 600,
  fade: true,
});

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <UpdatesProvider>
            <LoadingProvider>
              <AppContent />
              <LoadingScreen />
              <UpdateToastWrapper />
            </LoadingProvider>
          </UpdatesProvider>
        </ConvexAuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { activeTheme } = useTheme();
  const user = useQuery(api.users.currentUser);

  useEffect(() => {
    if (user !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [user]);

  return (
    <View style={activeTheme} className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

function UpdateToastWrapper() {
  const { isUpdateAvailable, applyUpdate } = useUpdatesContext();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowToast(true);
    }
  }, [isUpdateAvailable]);

  return (
    <UpdateToast
      isVisible={showToast}
      onPress={applyUpdate}
      onDismiss={() => setShowToast(false)}
    />
  );
}