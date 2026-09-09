import { Tabs } from 'expo-router';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from 'react-native';

// For icons, we'll just use a simple text placeholder for now or unicode
// In a real app you'd use @expo/vector-icons

export default function TabLayout() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surfaceSpaceElevated,
          borderTopColor: theme.glassBorder,
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.onSurfaceVariant,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="campusverse"
        options={{
          title: 'Map',
        }}
      />
      <Tabs.Screen
        name="squadup"
        options={{
          title: 'Squad',
        }}
      />
      <Tabs.Screen
        name="eventhub"
        options={{
          title: 'Events',
        }}
      />
      <Tabs.Screen
        name="clubverse"
        options={{
          title: 'Clubs',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
