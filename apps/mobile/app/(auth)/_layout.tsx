import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="lpu-verify" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding-profile" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding-skills" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
