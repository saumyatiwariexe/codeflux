import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { XPBar } from '../../components/ui/XPBar';
import { useThemeStore } from '../../stores/useThemeStore';
import { Ionicons } from '@expo/vector-icons';

// Mock feed data
const MOCK_STORIES = [
  { id: '1', name: 'HackLPU', hasNew: true, emoji: '' },
  { id: '2', name: 'Aarav', hasNew: true, emoji: null },
  { id: '3', name: 'GDSC', hasNew: false, emoji: '' },
  { id: '4', name: 'Priya', hasNew: true, emoji: null },
  { id: '5', name: 'ACM', hasNew: false, emoji: '' },
];

const MOCK_FEED = [
  {
    id: 'f1', type: 'event_live',
    title: 'HackLPU 2026 Opening Ceremony — LIVE',
    body: 'Keynote kickoff with 842 students. Mentor matchmaking now open.',
    badge: 'LIVE NOW', badgeVariant: 'notification' as const, attendees: 842,
    time: '2m ago',
  },
  {
    id: 'f2', type: 'squad_match',
    title: ' New Squad Match!',
    body: 'You matched with Aarav Sharma — 94% Synergy. Start a conversation.',
    badge: '94% SYNERGY', badgeVariant: 'squad' as const,
    time: '15m ago',
  },
  {
    id: 'f3', type: 'quest',
    title: ' Daily Quest Available',
    body: 'Morning Mover: Check in at the Sports Complex before 9 AM for +50 XP.',
    badge: '+50 XP', badgeVariant: 'xp' as const,
    time: '1h ago',
  },
  {
    id: 'f4', type: 'club',
    title: ' GDSC LPU: New Session',
    body: 'Flutter & Firebase workshop this Friday at Block 32. 48 seats left.',
    badge: 'Register', badgeVariant: 'squad' as const,
    time: '2h ago',
  },
];

export default function HomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [notifCount] = useState(3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surfaceSpaceDeep + 'F0' }]}>
        <View style={styles.headerLeft}>
          <Text variant="headline-sm" style={{ letterSpacing: -0.5 }}>Paladeium</Text>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, { backgroundColor: theme.neonEmerald }]} />
            <Text variant="label-sm" color="onSurfaceVariant">LPU Active</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.questBtn, { backgroundColor: theme.primaryContainer, marginRight: 6 }]}
            onPress={() => router.push('/questzone')}
          >
            <Ionicons name="map" size={16} color={theme.primary} />
            <Text variant="label-sm" style={{ color: theme.primary, marginLeft: 4 }}>Quests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.questBtn, { backgroundColor: theme.errorContainer, marginRight: 8 }]}
            onPress={() => router.push('/lostfound')}
          >
            <Ionicons name="search" size={16} color={theme.error} />
            <Text variant="label-sm" style={{ color: theme.error, marginLeft: 4 }}>Lost</Text>
          </TouchableOpacity>
          {/* Chat Button */}
          <TouchableOpacity 
            style={[styles.iconBtn, { backgroundColor: theme.surfaceContainerLow }]}
            onPress={() => router.push('/pulsechat')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.onSurface} />
            <View style={[styles.notifBadge, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.notifCount, { color: theme.onSecondary }]}>1</Text>
            </View>
          </TouchableOpacity>
          {/* Notification Bell */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceContainerLow }]}>
            <Ionicons name="notifications-outline" size={20} color={theme.onSurface} />
            {notifCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: theme.secondary }]}>
                <Text style={[styles.notifCount, { color: theme.onSecondary }]}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Profile avatar */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar displayName="You" size={36} showOnlineDot isOnline />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ---- Stories Bar ---- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesWrapper}>
          <View style={styles.storiesRow}>
            {/* Add Story */}
            <TouchableOpacity style={styles.storyItem}>
              <View style={[styles.storyCircle, { backgroundColor: theme.surfaceContainerHigh, borderStyle: 'dashed', borderColor: theme.outline, borderWidth: 1.5 }]}>
                <Text style={{ fontSize: 22 }}>+</Text>
              </View>
              <Text variant="label-xs" color="onSurfaceVariant" numberOfLines={1}>Your Pulse</Text>
            </TouchableOpacity>
            {/* Stories */}
            {MOCK_STORIES.map((s) => (
              <TouchableOpacity key={s.id} style={styles.storyItem}>
                <View
                  style={[
                    styles.storyCircle,
                    {
                      backgroundColor: theme.surfaceContainerHigh,
                      borderWidth: s.hasNew ? 2 : 0,
                      borderColor: s.hasNew ? theme.primary : 'transparent',
                    },
                  ]}
                >
                  {s.emoji
                    ? <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                    : <Avatar displayName={s.name} size={52} />
                  }
                </View>
                <Text variant="label-xs" numberOfLines={1}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ---- XP Progress Card ---- */}
        <Card variant="glass" style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text variant="label-sm" color="onSurfaceVariant">PULSE LEVEL 4</Text>
              <Text variant="headline-sm">Campus Regular</Text>
            </View>
            <Badge label=" 6-Day Streak" variant="squad" />
          </View>
          <View style={{ marginTop: 12, gap: 6 }}>
            <View style={styles.xpLabelRow}>
              <Text variant="label-sm" color="onSurfaceVariant">3,500 / 5,000 XP</Text>
              <Text variant="label-sm" color="neonEmerald">+1,500 XP to Level 5</Text>
            </View>
            <XPBar current={3500} total={5000} />
          </View>
          <TouchableOpacity
            style={[styles.questCTA, { backgroundColor: theme.primaryContainer }]}
            onPress={() => router.push('/quest')}
          >
            <Text variant="label-sm" style={{ color: theme.primary }}> View Today's Quests →</Text>
          </TouchableOpacity>
        </Card>

        {/* ---- Feed ---- */}
        <View style={styles.feedHeader}>
          <Text variant="headline-sm">Daily Pulse</Text>
          <Text variant="label-sm" color="onSurfaceVariant">{MOCK_FEED.length} updates</Text>
        </View>

        {MOCK_FEED.map((item) => (
          <Card key={item.id} variant="default" style={styles.feedCard}>
            <View style={styles.feedMeta}>
              <Badge label={item.badge} variant={item.badgeVariant} />
              <Text variant="label-xs" color="onSurfaceVariant">{item.time}</Text>
            </View>
            <Text variant="headline-sm" style={{ marginTop: 8 }}>{item.title}</Text>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>{item.body}</Text>
            {item.type === 'squad_match' && (
              <Button title=" Start Chat" variant="primary" style={{ marginTop: 12, height: 40 }} onPress={() => router.push('/pulsechat')} />
            )}
            {item.type === 'event_live' && (
              <Button title="Join Stream →" variant="primary" style={{ marginTop: 12, height: 40 }} />
            )}
            {item.type === 'quest' && (
              <Button title="View Quest Zone →" variant="primary" style={{ marginTop: 12, height: 40 }} onPress={() => router.push('/questzone')} />
            )}
          </Card>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 64, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, justifyContent: 'space-between',
  },
  headerLeft: { flex: 1, gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  questBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  notifCount: { fontSize: 9, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  storiesWrapper: { marginHorizontal: -20, paddingLeft: 20 },
  storiesRow: { flexDirection: 'row', gap: 14, paddingRight: 20, paddingTop: 16 },
  storyItem: { alignItems: 'center', gap: 6, width: 64 },
  storyCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  xpCard: { padding: 20 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  questCTA: {
    marginTop: 12, padding: 10, borderRadius: 12,
    alignItems: 'center',
  },
  feedHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  feedCard: { padding: 16 },
  feedMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
