import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { useThemeStore } from '../stores/useThemeStore';
import { useAuthStore } from '../stores/useAuthStore';

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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

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
    } else {
      setUser(null);
    }
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

/** Root layout — wraps the whole app in ClerkProvider. */
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <InnerLayout />
    </ClerkProvider>
  );
}
