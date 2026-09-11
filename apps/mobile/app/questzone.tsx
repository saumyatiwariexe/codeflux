import React from 'react';
import { ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { XPBar } from '../components/ui/XPBar';
import { useThemeStore } from '../stores/useThemeStore';

const { width: SCREEN_W } = Dimensions.get('window');

const ACTIVE_QUESTS = [
  { id: 'q1', type: 'explorer', title: 'Campus Explorer: The Great Outdoors', desc: 'Visit 5 different outdoor locations across campus.', xp: 250, progress: 3, total: 5 },
  { id: 'q2', type: 'academic', title: 'Library Scholar', desc: 'Spend 10 hours in the Central Library this week.', xp: 500, progress: 8, total: 10 },
  { id: 'q3', type: 'social', title: 'Networker', desc: 'Attend 2 club meetings or events.', xp: 150, progress: 1, total: 2 },
];

const COMPLETED_QUESTS = [
  { id: 'c1', title: 'First Day Freshman', xp: 50, date: 'Aug 15' },
  { id: 'c2', title: 'Cafeteria Connoisseur', xp: 100, date: 'Aug 20' },
];

export default function QuestZoneScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text variant="headline-md">QuestZone</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Stats */}
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="person" size={32} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="headline-sm">Level 5</Text>
              <Text variant="label-sm" color="onSurfaceVariant">Aarav Sharma</Text>
              <View style={{ marginTop: 8 }}>
                <XPBar current={8400} total={10000} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text variant="label-xs" color="onSurfaceVariant">8,400 XP</Text>
                  <Text variant="label-xs" color="onSurfaceVariant">10,000 XP</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Text variant="headline-sm" style={{ marginTop: 24, marginBottom: 12 }}>Active Quests</Text>
        
        {ACTIVE_QUESTS.map((q) => (
          <Card key={q.id} variant="default" style={styles.questCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <View style={[styles.iconBox, { backgroundColor: q.type === 'explorer' ? theme.neonEmerald + '20' : q.type === 'academic' ? theme.primaryContainer : theme.accentGold + '20' }]}>
                <Ionicons 
                  name={q.type === 'explorer' ? 'map' : q.type === 'academic' ? 'library' : 'people'} 
                  size={20} 
                  color={q.type === 'explorer' ? theme.neonEmerald : q.type === 'academic' ? theme.primary : theme.accentGold} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline-sm">{q.title}</Text>
                <Badge label={`+${q.xp} XP`} variant="xp" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
              </View>
            </View>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginBottom: 12 }}>{q.desc}</Text>
            
            <View style={styles.progressRow}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceContainerHigh }]}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${(q.progress / q.total) * 100}%` }]} />
              </View>
              <Text variant="label-sm" color="onSurfaceVariant">{q.progress}/{q.total}</Text>
            </View>
          </Card>
        ))}

        <Text variant="headline-sm" style={{ marginTop: 24, marginBottom: 12 }}>Completed Quests</Text>
        
        {COMPLETED_QUESTS.map((c) => (
          <View key={c.id} style={[styles.completedItem, { borderBottomColor: theme.glassBorder }]}>
            <View style={{ flex: 1 }}>
              <Text variant="body-md" style={{ fontWeight: '600' }}>{c.title}</Text>
              <Text variant="label-xs" color="onSurfaceVariant">{c.date}</Text>
            </View>
            <Badge label={`+${c.xp} XP`} variant="xp" />
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  content: { paddingHorizontal: 20 },
  statsCard: { padding: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  questCard: { padding: 16, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  completedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
});
