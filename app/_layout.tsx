import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { activeTheme } = useTheme();
  return (
    <View style={activeTheme} className="flex-1 bg-background">
      <Stack />
    </View>
  );
}