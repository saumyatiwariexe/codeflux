import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useThemeStore } from '../../stores/useThemeStore';

const CLUBS = [
  { id: 'club_acm', name: 'ACM Student Chapter', icon: 'terminal', category: 'tech', members: 420, isRecruiting: true, deadline: '14 days', tags: ['Competitive Programming', 'Tech Talks', 'Placement Prep'] },
  { id: 'club_gdsc', name: 'Google Developer Student Club', icon: 'logo-google', category: 'tech', members: 380, isRecruiting: true, deadline: 'Open', tags: ['Flutter', 'Firebase', 'Cloud'] },
  { id: 'club_robotics', name: 'Robotics Club LPU', icon: 'hardware-chip', category: 'tech', members: 180, isRecruiting: true, deadline: '7 days', tags: ['ROS', 'Arduino', 'SIH'] },
  { id: 'club_spicmacay', name: 'SPIC MACAY LPU', icon: 'musical-notes', category: 'cultural', members: 250, isRecruiting: false, deadline: null, tags: ['Classical Music', 'Dance', 'Heritage'] },
  { id: 'club_ecell', name: 'Entrepreneurship Cell', icon: 'rocket', category: 'academic', members: 310, isRecruiting: true, deadline: '7 days', tags: ['Startups', 'Pitching', 'Funding'] },
];

type CatFilter = 'all' | 'tech' | 'cultural' | 'academic' | 'sports';
const CAT_LABELS: Record<string, string> = { all: 'All', tech: 'Tech', cultural: 'Cultural', academic: 'Academic', sports: 'Sports' };

export default function ClubVerseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [filter, setFilter] = useState<CatFilter>('all');

  const filtered = CLUBS.filter((c) => filter === 'all' || c.category === filter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headline-md">ClubVerse </Text>
        <Text variant="body-sm" color="onSurfaceVariant">Find your LPU tribe</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {Object.entries(CAT_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterTab, { backgroundColor: filter === key ? theme.primary : theme.surfaceContainerLow }]}
              onPress={() => setFilter(key as CatFilter)}
            >
              <Text variant="label-sm" style={{ color: filter === key ? theme.onPrimary : theme.onSurface }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((club) => (
          <Card key={club.id} variant="default" style={styles.clubCard}>
            <View style={styles.clubTop}>
              <View style={[styles.clubIcon, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name={club.icon as any} size={26} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.clubHeader}>
                  <Text variant="headline-sm" numberOfLines={1}>{club.name}</Text>
                  {club.isRecruiting && <Badge label="Recruiting!" variant="notification" />}
                </View>
                <Text variant="label-sm" color="onSurfaceVariant">{club.members} members</Text>
              </View>
            </View>
            <View style={styles.tagsRow}>
              {club.tags.map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Text variant="label-xs" color="onSurfaceVariant">{t}</Text>
                </View>
              ))}
            </View>
            <View style={styles.clubFooter}>
              {club.deadline && (
                <Text variant="label-sm" color="onSurfaceVariant">Deadline: {club.deadline}</Text>
              )}
              <Button
                title={club.isRecruiting ? 'Apply Now' : 'View Club'}
                variant={club.isRecruiting ? 'primary' : 'secondary'}
                style={{ height: 36, paddingHorizontal: 16 }}
              />
            </View>
          </Card>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  filterScroll: { flexGrow: 0 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  clubCard: { padding: 16, gap: 12 },
  clubTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  clubIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  clubHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  clubFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
});
