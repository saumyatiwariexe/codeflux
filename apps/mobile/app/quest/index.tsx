import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { XPBar } from '../../components/ui/XPBar';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { questsApi, usersApi, setAuthToken } from '../../services/api';

type QuestType = 'all' | 'explorer' | 'academic' | 'social' | 'daily' | 'weekly';

const QUEST_TYPES: { key: QuestType; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'daily', label: 'Daily', emoji: '' },
  { key: 'weekly', label: 'Weekly', emoji: '' },
  { key: 'explorer', label: 'Explorer', emoji: '' },
  { key: 'social', label: 'Social', emoji: '' },
  { key: 'academic', label: 'Academic', emoji: '📚' },
];

const MOCK_QUESTS = [
  { id: 'q1', title: 'Campus Explorer', type: 'explorer', desc: 'Visit the main library, MAC, and Block 32.', xpReward: 500, status: 'available', icon: '🗺️' },
  { id: 'q2', title: 'HackLPU Registration', type: 'academic', desc: 'Register for the upcoming HackLPU event and form a team.', xpReward: 1000, progress: 1, total: 3, status: 'in_progress', icon: '💻', timeLeft: '2d left' },
  { id: 'q3', title: 'Social Butterfly', type: 'social', desc: 'Match with 5 people on SquadUp.', xpReward: 800, progress: 5, total: 5, status: 'completed', icon: '🤝' },
  { id: 'q4', title: 'Morning Hustle', type: 'daily', desc: 'Attend a morning lecture before 9 AM.', xpReward: 300, progress: 0, total: 1, status: 'available', icon: '☕', timeLeft: '14h left' },
  { id: 'q5', title: 'Library Scavenger', type: 'weekly', desc: 'Find the hidden QR code in the central library fiction section.', xpReward: 1500, progress: 0, total: 1, status: 'available', icon: '📚', timeLeft: '5d left' },
  { id: 'q6', title: 'Tech Talk Attendee', type: 'academic', desc: 'Attend any guest lecture this week.', xpReward: 600, status: 'available', icon: '🎤' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, handle: 'isha.kashyap', displayName: 'Isha Kashyap', department: 'CSE', level: 8, campusXp: 15400 },
  { rank: 2, handle: 'oggy.ji', displayName: 'Oggy ji', department: 'Design', level: 7, campusXp: 14200 },
  { rank: 3, handle: 'saumyatiwari', displayName: 'Saumya Tiwari', department: 'BCA', level: 6, campusXp: 9500 },
  { rank: 4, handle: 'karansinghal.7', displayName: 'Karan Singhal', department: 'CSE', level: 5, campusXp: 8100 },
  { rank: 5, handle: 'tara.senn', displayName: 'Tara Sen', department: 'MBA', level: 4, campusXp: 6400 },
];

const STATUS_BADGE = {
  available: { label: 'Available', variant: 'xp' as const },
  in_progress: { label: 'In Progress', variant: 'squad' as const },
  completed: { label: '✓ Done', variant: 'notification' as const },
};

export default function QuestZoneScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [activeType, setActiveType] = useState<QuestType>('all');
  const [view, setView] = useState<'quests' | 'leaderboard'>('quests');

  const userAuth = useAuthStore((state) => state.user);
  
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSameer = userAuth?.email?.toLowerCase().includes('sameersingh');

  useEffect(() => {
    async function fetchData() {
      if (userAuth?.token) {
        setAuthToken(userAuth.token);
      }
      
      try {
        const [profileRes, questsRes, leaderRes] = await Promise.all([
          usersApi.getMe(),
          questsApi.list(),
          questsApi.leaderboard()
        ]);

        if (profileRes.success) setProfile(profileRes.data);
        if (questsRes.success && questsRes.data && questsRes.data.length > 0) {
          setQuests(questsRes.data);
        } else {
          setQuests(MOCK_QUESTS);
        }
        
        if (leaderRes.success && leaderRes.data && leaderRes.data.length > 0) {
          setLeaderboard(leaderRes.data);
        } else {
          setLeaderboard(MOCK_LEADERBOARD);
        }
      } catch (err) {
        console.error('Failed to fetch quest data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userAuth]);

  const displayName = isSameer ? 'Saumya Tiwari' : (profile?.displayName || 'Paladeium User');
  const level = isSameer ? 6 : (profile?.level || 1);
  const currentXp = isSameer ? 9500 : (profile?.campusXp || 0);
  const totalXp = isSameer ? 10000 : (level * 1000 + 1000); // Mock total for next level
  const dept = profile?.department || 'Unknown';

  const activeHandle = isSameer ? 'saumyatiwari' : (profile?.handle || 'saumyatiwari'); // Fallback for demo
  const myRank = leaderboard.findIndex((l) => l.handle === activeHandle) + 1;
  const rankDisplay = myRank > 0 ? `#${myRank}` : 'Unranked';

  const filtered = quests.filter((q) => activeType === 'all' || q.type === activeType);
  const completedToday = quests.filter((q) => q.status === 'completed').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headline-md">QuestZone </Text>
          <Text variant="body-sm" color="onSurfaceVariant">{completedToday} done today · {totalXp.toLocaleString()} total XP</Text>
        </View>
        <View style={styles.viewToggle}>
          {(['quests', 'leaderboard'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.viewBtn, { backgroundColor: view === v ? theme.primary : theme.surfaceContainerLow }]}
              onPress={() => setView(v)}
            >
              <Text variant="label-sm" style={{ color: view === v ? theme.onPrimary : theme.onSurfaceVariant }}>
                {v === 'quests' ? ' Quests' : ' Board'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {view === 'quests' ? (
        <>
          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {QUEST_TYPES.map((qt) => (
                <TouchableOpacity
                  key={qt.key}
                  style={[styles.filterTab, { backgroundColor: activeType === qt.key ? theme.primary : theme.surfaceContainerLow }]}
                  onPress={() => setActiveType(qt.key)}
                >
                  <Text style={{ fontSize: 12 }}>{qt.emoji}</Text>
                  <Text variant="label-sm" style={{ color: activeType === qt.key ? theme.onPrimary : theme.onSurface, marginLeft: 4 }}>
                    {qt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text variant="body-md" color="onSurfaceVariant">Loading quests...</Text>
            ) : filtered.length === 0 ? (
               <Text variant="body-md" color="onSurfaceVariant">No quests found.</Text>
            ) : filtered.map((q) => {
              const statusInfo = STATUS_BADGE[q.status as keyof typeof STATUS_BADGE] || STATUS_BADGE.available;
              const isCompleted = q.status === 'completed';
              return (
                <Card
                  key={q.id}
                  variant={q.status === 'in_progress' ? 'glass' : 'default'}
                  style={[styles.questCard, isCompleted && { opacity: 0.6 }]}
                >
                  <View style={styles.questTop}>
                    <View style={[styles.questIcon, { backgroundColor: theme.primaryContainer }]}>
                      <Text style={{ fontSize: 22 }}>{q.icon || '⭐'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.questHeader}>
                        <Badge label={statusInfo.label} variant={statusInfo.variant} />
                        {q.timeLeft && (
                          <Text variant="label-xs" color="onSurfaceVariant"> {q.timeLeft}</Text>
                        )}
                      </View>
                      <Text variant="headline-sm" style={{ marginTop: 6 }}>{q.title}</Text>
                      <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }} numberOfLines={2}>
                        {q.description || q.desc}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar for in-progress quests */}
                  {q.status === 'in_progress' && (q.total || 1) > 1 && (
                    <View style={{ marginTop: 12, gap: 4 }}>
                      <View style={styles.progressLabel}>
                        <Text variant="label-sm" color="onSurfaceVariant">Progress</Text>
                        <Text variant="label-sm" color="primary">{q.progress || 0}/{q.total || 1}</Text>
                      </View>
                      <XPBar current={q.progress || 0} total={q.total || 1} color={theme.neonEmerald} height={6} />
                    </View>
                  )}

                  {/* Footer */}
                  <View style={styles.questFooter}>
                    <View style={[styles.xpPill, { backgroundColor: theme.accentGold + '22' }]}>
                      <Text variant="label-md" style={{ color: theme.accentGold }}>+{q.xpReward || q.xp} XP</Text>
                    </View>
                    {!isCompleted && (
                      <TouchableOpacity 
                        style={[styles.startBtn, { backgroundColor: theme.primary }]}
                        onPress={() => Alert.alert('Quest Action', 'Quest progression coming soon!')}
                      >
                        <Text variant="label-sm" style={{ color: theme.onPrimary }}>
                          {q.status === 'in_progress' ? 'Continue →' : 'Start Quest →'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })}
            <View style={{ height: 32 }} />
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card variant="glass" style={{ padding: 20, marginBottom: 16 }}>
            <Text variant="label-sm" color="onSurfaceVariant">YOUR RANKING</Text>
            <Text variant="headline-lg" color="primary">{rankDisplay} on Campus</Text>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>
              Keep exploring to climb the leaderboard!
            </Text>
          </Card>
          {loading ? (
             <Text variant="body-md" color="onSurfaceVariant">Loading leaderboard...</Text>
          ) : leaderboard.length === 0 ? (
             <Text variant="body-md" color="onSurfaceVariant">No players on the leaderboard yet.</Text>
          ) : leaderboard.map((entry) => (
            <Card key={entry.rank} variant={entry.handle === profile?.handle ? 'glass' : 'default'} style={styles.leaderCard}>
              <View style={styles.leaderRow}>
                <Text variant="headline-md" style={{ width: 32, textAlign: 'center', color: entry.rank <= 3 ? theme.accentGold : theme.onSurfaceVariant }}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="headline-sm">{entry.displayName || entry.name} {entry.handle === profile?.handle && '(You)'}</Text>
                  <Text variant="label-sm" color="onSurfaceVariant">{entry.department || entry.dept} · Level {entry.level}</Text>
                </View>
                <Text variant="headline-sm" color="primary">{(entry.campusXp || entry.xp).toLocaleString()} XP</Text>
              </View>
            </Card>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewToggle: { flexDirection: 'row', gap: 6 },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  filterScroll: { flexGrow: 0 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  questCard: { padding: 16, gap: 0 },
  questTop: { flexDirection: 'row', gap: 14 },
  questIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  questFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  xpPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  startBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  leaderCard: { padding: 14, marginBottom: 8 },
  leaderRow: { flexDirection: 'row', alignItems: 'center' },
});
