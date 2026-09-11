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
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../stores/useThemeStore';
import { initApi } from '../services/api';
import { setClerkToken } from '../services/supabase';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — user will need to sign in again
    }
  },
};

function RootLayoutInner() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // Wire Clerk token into API and Supabase
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      const getAuthToken = async () => {
        try {
          const t = await getToken({ template: 'supabase' });
          if (t) return t;
        } catch {
          // Fall back to standard session token
        }
        return await getToken();
      };

      initApi(getAuthToken);
      getAuthToken().then((t) => setClerkToken(t));
    } else {
      setClerkToken(null);
    }
  }, [isSignedIn, isLoaded]);

  // Auth guard: redirect once Clerk is loaded and fonts are ready
  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    if (!isSignedIn) {
      router.replace('/(auth)/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, fontsLoaded]);

  if (!fontsLoaded || !isLoaded) return null;

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
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="quest/index" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="edurev/index" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="lostfound/index" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <RootLayoutInner />
    </ClerkProvider>
  );
}
