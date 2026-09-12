import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

type Category = 'all' | 'hackathon' | 'workshop' | 'cultural' | 'sports' | 'academic';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'hackathon', label: 'Hackathons' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'sports', label: 'Sports' },
  { key: 'academic', label: 'Academic' },
];

const MOCK_EVENTS = [
  {
    id: 'evt_webathon',
    category: 'hackathon',
    title: 'WEB-A-THON 2.0 | LPU’s Next Big Hackathon',
    organizer: 'Metaverse',
    deadline: 'Sep 25',
    teamSize: '2–4',
    prize: '₹1,00,000',
    fee: '₹169',
    attendees: 412,
    status: 'upcoming',
    tags: ['Web3', 'Hackathon'],
    isSpotlight: true,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/web-a-thon-20--lpus-next-big-hackathon-6aa2c8e7f28decc1178eb634-1789162899017.png'
  },
  {
    id: 'evt_codeheist',
    category: 'hackathon',
    title: 'Code Heist Hackathon',
    organizer: 'Thryve',
    deadline: 'Sep 18',
    teamSize: '1–3',
    prize: '₹50,000',
    fee: '₹179',
    attendees: 320,
    status: 'upcoming',
    tags: ['AI', 'Security'],
    isSpotlight: false,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk4NjdlYjdmMTA4MzUwN2ZiOGRjZjkvMTc4ODUyODAxMzE3Ml82NjYyNDE0ZjcwOWU4NGZjMTI5YWFhZTVmZWU2MGI1MC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19'
  },
  {
    id: 'evt_code2career',
    category: 'hackathon',
    title: 'Code2Career AI Hackathon',
    organizer: 'Coding Ninjas LPU',
    deadline: 'Sep 18',
    teamSize: '1–4',
    prize: '₹75,000',
    fee: '₹199',
    attendees: 540,
    status: 'upcoming',
    tags: ['AI/ML', 'Career'],
    isSpotlight: false,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2NvZGUyY2FyZWVyLWFpLWhhY2thdGhvbi0xNzg4NzgzODY5ODQ4LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0='
  },
  {
    id: 'evt_anime',
    category: 'cultural',
    title: 'Anime Night 2.0',
    organizer: 'Play2Unite',
    deadline: 'Sep 17',
    teamSize: 'Solo',
    prize: undefined,
    fee: '₹99',
    attendees: 800,
    status: 'upcoming',
    tags: ['Anime', 'Screening'],
    isSpotlight: false,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTlmZWJhY2ZlN2VlYThhYzZhMDU1ZWEvMTc4OTExMDY4MDMxN18wNjAzNWRiYzk2OTA0NDEyNmQzYjI3ZTk5OWVlOTUyZS5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19'
  },
  {
    id: 'evt_goalrush',
    category: 'sports',
    title: 'GOAL RUSH',
    organizer: 'Gamers Guild',
    deadline: 'Sep 11',
    teamSize: '5v5',
    prize: '₹20,000',
    fee: '₹499',
    attendees: 120,
    status: 'upcoming',
    tags: ['Esports', 'FIFA'],
    isSpotlight: false,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2dvbGQtcnVzaC0xNzg3OTk1MzE1OTA1LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0='
  },
  {
    id: 'evt_paper',
    category: 'workshop',
    title: 'Paper Mache workshop',
    organizer: 'RENOVA',
    deadline: 'Sep 15',
    teamSize: 'Solo',
    prize: undefined,
    fee: '₹249',
    attendees: 45,
    status: 'upcoming',
    tags: ['Art', 'DIY'],
    isSpotlight: false,
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/paper-mache-workshop-6a9fb8135d8f22c034998d3a-1789050928527.jpg'
  }
];

export default function EventHubScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = MOCK_EVENTS.filter((e) => activeCategory === 'all' || e.category === activeCategory);
  const spotlight = MOCK_EVENTS.find((e) => e.isSpotlight);
  const rest = filtered.filter((e) => !e.isSpotlight);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headline-md">EventHub</Text>
        <Text variant="body-sm" color="onSurfaceVariant">LPU competitions & events</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <View style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.catTab,
                { backgroundColor: activeCategory === c.key ? theme.primary : theme.surfaceContainerLow },
              ]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text
                variant="label-sm"
                style={{ color: activeCategory === c.key ? theme.onPrimary : theme.onSurface }}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- Spotlight Card ---- */}
        {spotlight && (activeCategory === 'all' || spotlight.category === activeCategory) && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="headline-sm">Spotlight</Text>
              <Text variant="label-sm" color="secondary">Closing Soon!</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/event/${spotlight.id}`)}>
              <Card variant="elevated" style={styles.spotlightCard}>
                <View style={[styles.banner, { backgroundColor: theme.primaryContainer }]}>
                  {spotlight.posterUrl ? (
                    <Image source={{ uri: spotlight.posterUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  ) : (
                    <>
                      <Ionicons name="trophy" size={48} color={theme.primary} />
                      <Text variant="headline-lg" style={{ color: theme.primary, marginTop: 8 }}>
                        {spotlight.title}
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.spotlightBody}>
                  <Text variant="label-sm" color="onSurfaceVariant">{spotlight.organizer}</Text>
                  <Text variant="headline-md" style={{ marginTop: 4 }}>{spotlight.title}</Text>

                  <View style={styles.metaRow}>
                    {[
                      { label: 'Deadline', value: spotlight.deadline, color: theme.error },
                      { label: 'Team', value: spotlight.teamSize, color: theme.onSurface },
                      { label: 'Fee', value: spotlight.fee, color: theme.neonEmerald },
                    ].map((m) => (
                      <View key={m.label} style={[styles.metaBox, { backgroundColor: theme.surfaceContainerLow }]}>
                        <Text variant="label-xs" color="onSurfaceVariant">{m.label}</Text>
                        <Text variant="label-md" style={{ color: m.color }}>{m.value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Prize */}
                  <View style={[styles.prizeRow, { backgroundColor: theme.accentGold + '15' }]}>
                    <Ionicons name="gift" size={18} color={theme.accentGold} />
                    <Text variant="headline-sm" style={{ color: theme.accentGold, marginLeft: 8 }}>{spotlight.prize}</Text>
                    <Text variant="label-sm" color="onSurfaceVariant" style={{ marginLeft: 4 }}>in prizes</Text>
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {spotlight.tags.map((t) => (
                      <View key={t} style={[styles.tag, { backgroundColor: theme.surfaceContainerHigh }]}>
                        <Text variant="label-xs" color="onSurfaceVariant">{t}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                    <Button title="Register with SquadUp Team" style={{ flex: 1 }} />
                    <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.surfaceContainerHigh }]}>
                      <Ionicons name="share-outline" size={20} color={theme.onSurface} />
                    </TouchableOpacity>
                  </View>

                  <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center' }}>
                    {spotlight.attendees.toLocaleString()} registered{spotlight.attendees > 800 ? ' · High demand' : ''}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </>
        )}

        {/* ---- Active Challenges List ---- */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text variant="headline-sm">Active Challenges</Text>
          <Text variant="label-sm" color="onSurfaceVariant">{filtered.length} total</Text>
        </View>

        {rest.map((ev) => (
          <TouchableOpacity key={ev.id} onPress={() => router.push(`/event/${ev.id}`)}>
            <Card variant="default" style={styles.eventCard}>
              <View style={styles.eventCardInner}>
                {ev.posterUrl ? (
                  <Image source={{ uri: ev.posterUrl }} style={styles.eventIcon} />
                ) : (
                  <View style={[styles.eventIcon, { backgroundColor: theme.primaryContainer }]}>
                    <Ionicons
                      name={ev.category === 'hackathon' ? 'code-slash' : ev.category === 'cultural' ? 'musical-notes' : ev.category === 'academic' ? 'school' : ev.category === 'sports' ? 'football' : 'calendar'}
                      size={22}
                      color={theme.primary}
                    />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {ev.tags.slice(0, 2).map((t) => (
                      <Badge key={t} label={t} variant="xp" />
                    ))}
                  </View>
                  <Text variant="headline-sm">{ev.title}</Text>
                  <Text variant="body-sm" color="onSurfaceVariant">{ev.organizer}</Text>
                  <View style={styles.eventMeta}>
                    <Text variant="label-sm" color="onSurfaceVariant">{ev.deadline}</Text>
                    <Text variant="label-sm" color="onSurfaceVariant">Team: {ev.teamSize}</Text>
                    {ev.prize && (
                      <Text variant="label-sm" style={{ color: theme.accentGold }}>{ev.prize}</Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  catScroll: { flexGrow: 0, marginBottom: 4 },
  catRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  catTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spotlightCard: { overflow: 'hidden' },
  banner: { height: 160, alignItems: 'center', justifyContent: 'center' },
  spotlightBody: { padding: 20 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metaBox: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center', gap: 2 },
  prizeRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 14,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  shareBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  eventCard: { padding: 16 },
  eventCardInner: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  eventIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventMeta: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
});
