import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { XPBar } from '../components/ui/XPBar';
import { Avatar } from '../components/ui/Avatar';
import { useThemeStore } from '../stores/useThemeStore';
import { useAuthStore } from '../stores/useAuthStore';
import { questsApi, usersApi, setAuthToken } from '../services/api';

const { width: SCREEN_W } = Dimensions.get('window');

export default function QuestZoneScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  const userAuth = useAuthStore((state) => state.user);
  
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSameer = userAuth?.email?.toLowerCase().includes('sameersingh');

  useEffect(() => {
    async function fetchData() {
      if (userAuth?.token) {
        setAuthToken(userAuth.token);
      }
      
      try {
        const [profileRes, questsRes] = await Promise.all([
          usersApi.getMe(),
          questsApi.list()
        ]);

        if (profileRes.success) setProfile(profileRes.data);
        if (questsRes.success) setQuests(questsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch quest data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userAuth]);

  const displayName = isSameer ? 'Saumya Tiwari' : (profile?.displayName || 'Paladeium User');
  const avatarUrl = isSameer ? 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png' : profile?.avatarUrl;
  const level = isSameer ? 6 : (profile?.level || 1);
  const currentXp = isSameer ? 9500 : (profile?.campusXp || 0);
  const totalXp = isSameer ? 10000 : (level * 1000 + 1000); // Mock total for next level

  const activeQuests = quests.filter(q => q.status !== 'completed');
  const completedQuests = quests.filter(q => q.status === 'completed');

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
            <Avatar displayName={displayName} avatarUrl={avatarUrl} size={64} showOnlineDot isOnline />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="headline-sm">Level {level}</Text>
              <Text variant="label-sm" color="onSurfaceVariant">{displayName}</Text>
              <View style={{ marginTop: 8 }}>
                <XPBar current={currentXp} total={totalXp} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text variant="label-xs" color="onSurfaceVariant">{currentXp.toLocaleString()} XP</Text>
                  <Text variant="label-xs" color="onSurfaceVariant">{totalXp.toLocaleString()} XP</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Text variant="headline-sm" style={{ marginTop: 24, marginBottom: 12 }}>Active Quests</Text>
        
        {loading ? (
          <Text variant="body-md" color="onSurfaceVariant">Loading quests...</Text>
        ) : activeQuests.length === 0 ? (
          <Text variant="body-md" color="onSurfaceVariant">No active quests right now.</Text>
        ) : activeQuests.map((q) => (
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
                <Badge label={`+${q.xpReward || q.xp} XP`} variant="xp" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
              </View>
            </View>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginBottom: 12 }}>{q.description || q.desc}</Text>
            
            <View style={styles.progressRow}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceContainerHigh }]}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${((q.progress || 0) / (q.total || 1)) * 100}%` }]} />
              </View>
              <Text variant="label-sm" color="onSurfaceVariant">{q.progress || 0}/{q.total || 1}</Text>
            </View>
          </Card>
        ))}

        <Text variant="headline-sm" style={{ marginTop: 24, marginBottom: 12 }}>Completed Quests</Text>
        
        {loading ? (
          <Text variant="body-md" color="onSurfaceVariant">Loading completed quests...</Text>
        ) : completedQuests.length === 0 ? (
          <Text variant="body-md" color="onSurfaceVariant">You haven't completed any quests yet.</Text>
        ) : completedQuests.map((c) => (
          <View key={c.id} style={[styles.completedItem, { borderBottomColor: theme.glassBorder }]}>
            <View style={{ flex: 1 }}>
              <Text variant="body-md" style={{ fontWeight: '600' }}>{c.title}</Text>
              <Text variant="label-xs" color="onSurfaceVariant">Completed</Text>
            </View>
            <Badge label={`+${c.xpReward || c.xp} XP`} variant="xp" />
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
