import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { useThemeStore } from '../../stores/useThemeStore';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Squad Match!',
    body: 'You and Aarav Sharma liked each other.',
    time: '15m ago',
    icon: 'people',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Quest Completed',
    body: 'You earned 50 XP for Morning Mover.',
    time: '3h ago',
    icon: 'trophy',
    isRead: false,
  },
  {
    id: 'n3',
    title: 'Event Reminder',
    body: 'WEB-A-THON 2.0 starts tomorrow!',
    time: '1d ago',
    icon: 'calendar',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.glassBorder }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text variant="headline-sm">Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {MOCK_NOTIFICATIONS.map((n) => (
          <TouchableOpacity key={n.id} activeOpacity={0.8}>
            <Card
              variant="default"
              style={[
                styles.notifCard,
                {
                  backgroundColor: n.isRead ? theme.surfaceSpaceElevated : theme.surfaceContainerLow,
                  borderColor: n.isRead ? 'transparent' : theme.primary + '44',
                  borderWidth: 1,
                },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name={n.icon as any} size={20} color={theme.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text variant="label-md" style={{ fontWeight: n.isRead ? '500' : '700' }}>
                  {n.title}
                </Text>
                <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 2 }}>
                  {n.body}
                </Text>
                <Text variant="label-xs" color="onSurfaceVariant" style={{ marginTop: 4 }}>
                  {n.time}
                </Text>
              </View>
              {!n.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerRight: { width: 40 },
  content: { padding: 16, gap: 12 },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
