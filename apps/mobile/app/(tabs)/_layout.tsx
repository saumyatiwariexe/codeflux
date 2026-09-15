import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from '../../components/ui/Text';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { useEffect } from 'react';

export default function TabsLayout() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Global listener for cross-app events (like receiving a message while on the home feed)
    const globalSync = supabase.channel('global_sync')
      .on('broadcast', { event: 'chat_ping' }, (payload) => {
        const { to, roomId, message, senderName } = payload.payload;
        if (to === user.email?.toLowerCase()) {
          // 1. Ensure the chat exists in the inbox
          useChatStore.getState().addChat({
            id: roomId,
            name: senderName,
            msg: message.text,
            time: message.time,
            unread: 0,
            type: 'squad',
            messages: []
          });
          // 2. Add the actual message and patch the name just in case it was stuck on 'User'
          useChatStore.getState().addMessage(roomId, { ...message, sender: 'them' }, senderName);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(globalSync) };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surfaceSpaceElevated,
          borderTopColor: theme.glassBorder,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter',
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pulse',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "planet" : "planet-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="campusverse"
        options={{
          title: 'Campus',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="squadup"
        options={{
          title: 'Squad',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventhub"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubverse"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "color-palette" : "color-palette-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
