import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from '../../components/ui/Text';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <View style={[styles.tabIconWrapper, focused && { opacity: 1 }]}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? theme.primary : theme.onSurfaceVariant },
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
            <TabIcon emoji="" label="Pulse" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="campusverse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="" label="Campus" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="squadup"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="" label="Squad" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventhub"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="" label="Events" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubverse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="" label="Clubs" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="" label="Me" focused={focused} />
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
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontFamily: 'Inter', fontWeight: '600' },
});
