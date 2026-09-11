import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from '../../components/ui/Text';

interface TabIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

function TabIcon({ iconName, label, focused }: TabIconProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const color = focused ? theme.primary : theme.onSurfaceVariant;

  return (
    <View style={[styles.tabIconWrapper, focused && { opacity: 1 }]}>
      <Ionicons name={iconName} size={24} color={color} style={{ opacity: focused ? 1 : 0.8 }} />
      <Text
        style={[
          styles.tabLabel,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surfaceSpaceElevated,
          borderTopColor: theme.glassBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "planet" : "planet-outline"} label="Pulse" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="campusverse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "map" : "map-outline"} label="Campus" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="squadup"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "people" : "people-outline"} label="Squad" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventhub"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "calendar" : "calendar-outline"} label="Events" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubverse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "color-palette" : "color-palette-outline"} label="Clubs" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "person-circle" : "person-circle-outline"} label="Me" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  tabLabel: { fontSize: 10, fontFamily: 'Inter', fontWeight: '600' },
});
