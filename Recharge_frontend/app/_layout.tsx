import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="account" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="wallet" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="kyc-upload" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="support" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
