import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../stores/useThemeStore';
import { useAuthStore } from '../stores/useAuthStore';
import { initApi } from '../services/api';
import { setClerkToken } from '../services/supabase';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  
  // Use Zustand Mock Auth instead of Clerk
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // Mock API token setting
  useEffect(() => {
    if (isAuthenticated) {
      // In mock auth, we just provide a dummy token
      const getAuthToken = async () => 'mock-token-123';
      initApi(getAuthToken);
      setClerkToken('mock-token-123');
    } else {
      setClerkToken(null);
    }
  }, [isAuthenticated]);

  // Always start at tabs since mock auth is baked in
  useEffect(() => {
    if (!fontsLoaded) return;
    router.replace('/(tabs)');
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.surfaceSpaceDeep },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="quest/index" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="edurev/index" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="lostfound/index" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
