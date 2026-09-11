import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
<<<<<<< Updated upstream
import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
=======
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
>>>>>>> Stashed changes
import { useThemeStore } from '../stores/useThemeStore';
import { initApi } from '../services/api';
import { setClerkToken } from '../services/supabase';

<<<<<<< Updated upstream
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Inner layout that has access to Clerk hooks.
 * ClerkProvider must wrap this component.
 */
function InnerLayout() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const setUser = useAuthStore((s) => s.setUser);

  // Clerk session state
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
=======
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// ── Clerk token cache using expo-secure-store ────────────────────────────────
// Clerk recommends SecureStore for RN; it keeps session tokens
// in the device's secure enclave rather than AsyncStorage.
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

// ── Inner layout (has access to Clerk hooks) ─────────────────────────────────
function RootLayoutInner() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const { isSignedIn, isLoaded, getToken } = useAuth();
>>>>>>> Stashed changes

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

<<<<<<< Updated upstream
  // Sync Clerk user → local store
  useEffect(() => {
    if (!authLoaded) return;
    if (user) {
      setUser({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        displayName: user.fullName ?? user.username ?? 'Student',
        imageUrl: user.imageUrl,
      });
=======
  // Wire Clerk's getToken into the API service and Supabase client
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      const getAuthToken = async () => {
        try {
          const t = await getToken({ template: 'supabase' });
          if (t) return t;
        } catch {
          // No custom template named 'supabase' — fall back to standard session token
        }
        return await getToken();
      };

      // Inject Clerk token getter into both the REST API layer and Supabase
      initApi(getAuthToken);
      // Set the initial Supabase session token
      getAuthToken().then((t) => setClerkToken(t));
    } else {
      // Clear Supabase session on sign-out
      setClerkToken(null);
    }
  }, [isSignedIn, isLoaded]);

  // Auth guard: redirect once Clerk is loaded and fonts are ready
  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    if (!isSignedIn) {
      router.replace('/(auth)/welcome');
>>>>>>> Stashed changes
    } else {
      setUser(null);
    }
<<<<<<< Updated upstream
  }, [authLoaded, user]);

  // Auth guard: route once Clerk + fonts are ready
  useEffect(() => {
    if (!authLoaded || !fontsLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [authLoaded, isSignedIn, fontsLoaded]);

  if (!fontsLoaded || !authLoaded) return null;
=======
  }, [isLoaded, isSignedIn, fontsLoaded]);

  if (!fontsLoaded || !isLoaded) return null;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
/** Root layout — wraps the whole app in ClerkProvider. */
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <InnerLayout />
=======
// ── Root layout — wraps everything in ClerkProvider ──────────────────────────
export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <RootLayoutInner />
>>>>>>> Stashed changes
    </ClerkProvider>
  );
}
