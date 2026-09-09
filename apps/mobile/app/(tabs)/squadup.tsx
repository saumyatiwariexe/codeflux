import React from 'react';
import { ScrollView, View, StyleSheet, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

export default function SquadUpScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Top filter bar */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Button variant="primary" title="Discover" style={styles.filterPill} />
          <Button variant="secondary" title="Matches 3" style={styles.filterPill} />
          <Button variant="secondary" title="Teams 1" style={styles.filterPill} />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Match Card */}
        <Card variant="default" style={styles.matchCard}>
          <View style={[styles.matchIcon, { backgroundColor: theme.tertiaryContainer }]}>
            <Text variant="headline-sm" color="onTertiaryContainer">🧠</Text>
          </View>
          <View style={styles.matchText}>
            <Text variant="headline-sm" color="neonEmerald">94% Synergy Score</Text>
            <Text variant="body-sm" color="onSurfaceVariant">Complementary roles: You (Backend) + Aarav (Frontend)</Text>
          </View>
        </Card>

        {/* Profile Swipe Card */}
        <Card variant="elevated" style={styles.swipeCard}>
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceContainerLowest }]} />
          
          <View style={styles.cardHeader}>
            <Badge label="HackLPU Dream Team" variant="squad" />
            <Badge label="Lvl 5 · 8,400 XP" variant="xp" />
          </View>

          <View style={styles.cardFooter}>
            <Text variant="headline-lg">Aarav Sharma</Text>
            <Text variant="body-md" color="onSurfaceVariant">B.Tech CSE · 3rd Year · Day Scholar</Text>
          </View>
        </Card>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <Card variant="glass" style={styles.detailBox}>
            <Text variant="label-sm" color="onSurfaceVariant">MY GO-TO TECH STACK IS...</Text>
            <Text variant="headline-sm" style={{ marginTop: 8 }}>Next.js 14, PyTorch, Supabase & Tailwind. I build blazing-fast LLM wrappers.</Text>
          </Card>

          <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 16 }}>SKILLS AARAV BRINGS</Text>
          <View style={styles.skillsWrapper}>
            <Badge label="Frontend (Expert)" variant="squad" style={{ backgroundColor: theme.primaryContainer, borderColor: theme.primary }} />
            <Badge label="Computer Vision" variant="squad" />
            <Badge label="FastAPI" variant="squad" />
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.actionRow, { backgroundColor: theme.surfaceSpaceElevated + 'E6' }]}>
         <Button variant="icon" title="✖" style={{ backgroundColor: theme.surfaceContainerHigh }} />
         <Button variant="icon" title="★" style={{ backgroundColor: theme.accentGold + '33' }} />
         <Button variant="icon" title="💬" style={{ backgroundColor: theme.surfaceContainerHigh }} />
         <Button variant="icon" title="⚡" style={{ backgroundColor: theme.primary, width: 64, height: 64, borderRadius: 32 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterPill: { height: 36 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  matchCard: { padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  matchIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  matchText: { flex: 1 },
  swipeCard: { height: 400, position: 'relative' },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject },
  cardHeader: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  cardFooter: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  detailsContainer: { marginTop: 16 },
  detailBox: { padding: 16 },
  skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionRow: { position: 'absolute', bottom: 80, alignSelf: 'center', flexDirection: 'row', padding: 12, borderRadius: 99, gap: 16, alignItems: 'center' },
});
