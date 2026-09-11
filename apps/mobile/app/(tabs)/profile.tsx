import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { XPBar } from '../../components/ui/XPBar';
import { AchievementBadge } from '../../components/profile/AchievementBadge';
import { SkillTag } from '../../components/profile/SkillTag';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';

const MOCK_PROFILE = {
  displayName: 'Paladeium User',
  handle: 'campus_user',
  department: 'CSE',
  year: 3,
  degreeLevel: 'UG',
  hostelBlock: 'Block 32',
  bio: 'Exploring LPU one quest at a time. Builder. Dreamer. HackLPU contestant.',
  campusXp: 3500,
  level: 4,
  xpToNextLevel: 5000,
  streakDays: 6,
  skills: [
    { name: 'Node.js', proficiency: 'intermediate' as const },
    { name: 'React Native', proficiency: 'beginner' as const },
    { name: 'Python', proficiency: 'intermediate' as const },
    { name: 'Figma', proficiency: 'beginner' as const },
  ],
  badges: [
    { name: 'First Steps', emoji: '', rarity: 'common' as const },
    { name: 'EduRev Pioneer', emoji: '', rarity: 'common' as const },
    { name: 'Squad Founder', emoji: '', rarity: 'rare' as const },
    { name: 'Campus Explorer', emoji: '', rarity: 'rare' as const },
  ],
  stats: { events: 4, squads: 2, quests: 8, achievements: 3 },
};

export default function ProfileScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const [squadVisible, setSquadVisible] = useState(true);
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const signOutStore = useAuthStore((s) => s.signOut);

  const p = MOCK_PROFILE;
  // Override with real Clerk user data where available
  const displayName = clerkUser?.fullName ?? clerkUser?.username ?? p.displayName;
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? '';
  const handle = clerkUser?.username ?? p.handle;
  const isEmailVerified = clerkUser?.primaryEmailAddress?.verification?.status === 'verified';
  const xpPercent = p.campusXp / p.xpToNextLevel;

  const STAT_ITEMS = [
    { label: 'Events', value: p.stats.events, emoji: '' },
    { label: 'Squads', value: p.stats.squads, emoji: '' },
    { label: 'Quests', value: p.stats.quests, emoji: '' },
    { label: 'EduRev', value: p.stats.achievements, emoji: '' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ---- Hero Header ---- */}
        <View style={styles.hero}>
          <Avatar displayName={displayName} size={80} showOnlineDot isOnline />
          <View style={styles.heroInfo}>
            <Text variant="headline-md">{displayName}</Text>
            <Text variant="body-sm" color="onSurfaceVariant">@{handle}</Text>
            <Text variant="label-sm" color="onSurfaceVariant">{p.department} · Year {p.year} · {p.hostelBlock}</Text>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: theme.primaryContainer }]}>
                <Text variant="label-sm" style={{ color: theme.primary }}>Level {p.level}</Text>
              </View>
              <Badge label={` ${p.streakDays}-Day Streak`} variant="squad" />
            </View>
          </View>
        </View>

        {/* Bio */}
        {p.bio && (
          <Text variant="body-md" color="onSurfaceVariant" style={styles.bio}>{p.bio}</Text>
        )}

        {/* ---- XP Progress ---- */}
        <Card variant="glass" style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text variant="label-sm" color="onSurfaceVariant">CAMPUS XP — LEVEL {p.level}</Text>
            <Text variant="label-sm" color="neonEmerald">+{(p.xpToNextLevel - p.campusXp).toLocaleString()} to Level {p.level + 1}</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <XPBar current={p.campusXp} total={p.xpToNextLevel} showLabel animated />
          </View>
        </Card>

        {/* ---- Stats Row ---- */}
        <View style={styles.statsRow}>
          {STAT_ITEMS.map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: theme.surfaceContainerLow }]}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text variant="headline-sm">{s.value}</Text>
              <Text variant="label-xs" color="onSurfaceVariant">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ---- Skills ---- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="headline-sm">Skills</Text>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.surfaceContainerLow }]}>
              <Text variant="label-sm" color="primary">Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillsGrid}>
            {p.skills.map((s) => (
              <SkillTag key={s.name} name={s.name} proficiency={s.proficiency} />
            ))}
          </View>
        </View>

        {/* ---- Badges ---- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="headline-sm">Badges</Text>
            <TouchableOpacity>
              <Text variant="label-sm" color="primary">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgesRow}>
              {p.badges.map((b) => (
                <AchievementBadge key={b.name} name={b.name} emoji={b.emoji} rarity={b.rarity} size="md" />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ---- EduRev Quick Stats ---- */}
        <TouchableOpacity onPress={() => router.push('/edurev')}>
          <Card variant="default" style={styles.edurevCard}>
            <View style={styles.edurevRow}>
              <Text style={{ fontSize: 28 }}></Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="headline-sm">EduRevolution</Text>
                <Text variant="body-sm" color="onSurfaceVariant">
                  3 achievements · 13% attendance relaxation earned
                </Text>
              </View>
              <Text variant="label-sm" color="primary">View →</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* ---- Settings ---- */}
        <Card variant="glass" style={styles.settingsCard}>
          <Text variant="headline-sm" style={{ marginBottom: 16 }}>Settings</Text>

          {/* Theme Toggle */}
          <View style={styles.settingRow}>
            <View>
              <Text variant="body-md">Dark Mode</Text>
              <Text variant="body-sm" color="onSurfaceVariant">
                {themeMode === 'system' ? `System (${systemColorScheme})` : themeMode}
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'system')}
              trackColor={{ false: theme.surfaceContainerHighest, true: theme.primary }}
              thumbColor={themeMode === 'dark' ? theme.onPrimary : '#FFFFFF'}
            />
          </View>

          {/* SquadUp Visibility */}
          <View style={[styles.settingRow, { marginTop: 12 }]}>
            <View>
              <Text variant="body-md">SquadUp Visibility</Text>
              <Text variant="body-sm" color="onSurfaceVariant">Show me in the swipe deck</Text>
            </View>
            <Switch
              value={squadVisible}
              onValueChange={setSquadVisible}
              trackColor={{ false: theme.surfaceContainerHighest, true: theme.neonEmerald }}
            />
          </View>

          {/* Email Verification */}
          <View style={[styles.verifyRow, { borderTopColor: theme.glassBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="mail" size={14} color={theme.onSurfaceVariant} />
              <Text variant="body-sm">{email || 'Email not set'}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: isEmailVerified ? theme.neonEmerald + '22' : theme.errorContainer }]}>
              <Text variant="label-xs" style={{ color: isEmailVerified ? theme.neonEmerald : theme.error }}>
                {isEmailVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: theme.error + '44' }]}
          onPress={async () => {
            await signOutStore();
            await signOut();
            router.replace('/(auth)/welcome');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.error} style={{ marginRight: 8 }} />
          <Text variant="label-md" style={{ color: theme.error }}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100, gap: 20 },
  hero: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  heroInfo: { flex: 1, gap: 3 },
  levelRow: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  bio: { marginTop: -8 },
  xpCard: { padding: 16 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 16, gap: 4,
  },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgesRow: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  edurevCard: { padding: 16 },
  edurevRow: { flexDirection: 'row', alignItems: 'center' },
  settingsCard: { padding: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingTop: 16, borderTopWidth: 1,
  },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  signOutBtn: {
    height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexDirection: 'row',
  },
});
