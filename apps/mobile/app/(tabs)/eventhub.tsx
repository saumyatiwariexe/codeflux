import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Image, Alert, FlatList, Dimensions
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

const MOCK_EVENTS: any[] = [];

export default function EventHubScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width: SCREEN_W } = Dimensions.get('window');

  const filtered = MOCK_EVENTS.filter((e) => activeCategory === 'all' || e.category === activeCategory);
  const activeSpotlights = filtered.filter((e) => e.isSpotlight);
  const rest = filtered.filter((e) => !e.isSpotlight);

  useEffect(() => {
    if (activeSpotlights.length <= 1) return;
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => {
        const nextIndex = (prev + 1) % activeSpotlights.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSpotlights.length]);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (SCREEN_W - 40));
    if (index >= 0 && index < activeSpotlights.length && index !== spotlightIndex) {
      setSpotlightIndex(index);
    }
  };

  const validIndex = spotlightIndex % (activeSpotlights.length || 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headline-md">EventHub</Text>
        <Text variant="body-sm" color="onSurfaceVariant">LPU competitions & events</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
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
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- Spotlight Card ---- */}
        {activeSpotlights.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="headline-sm">Spotlight</Text>
              <Text variant="label-sm" color="secondary">Closing Soon!</Text>
            </View>
            <FlatList
              ref={flatListRef}
              data={activeSpotlights}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              renderItem={({ item: spot }) => (
                <TouchableOpacity 
                  onPress={() => router.push(`/event/${spot.id}`)}
                  style={{ width: SCREEN_W - 40 }}
                  activeOpacity={0.9}
                >
                  <Card variant="elevated" style={styles.spotlightCard}>
                    <View style={[styles.banner, { backgroundColor: theme.primaryContainer }]}>
                      {spot.posterUrl ? (
                        <Image source={{ uri: spot.posterUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                      ) : (
                        <>
                          <Ionicons name="trophy" size={48} color={theme.primary} />
                          <Text variant="headline-lg" style={{ color: theme.primary, marginTop: 8 }}>
                            {spot.title}
                          </Text>
                        </>
                      )}
                    </View>
                    <View style={styles.spotlightBody}>
                      <Text variant="label-sm" color="onSurfaceVariant">{spot.organizer}</Text>
                      <Text variant="headline-md" style={{ marginTop: 4 }}>{spot.title}</Text>

                      <View style={styles.metaRow}>
                        {[
                          { label: 'Deadline', value: spot.deadline, color: theme.error },
                          { label: 'Team', value: spot.teamSize, color: theme.onSurface },
                          { label: 'Fee', value: spot.fee, color: theme.neonEmerald },
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
                        <Text variant="headline-sm" style={{ color: theme.accentGold, marginLeft: 8 }}>{spot.prize}</Text>
                        <Text variant="label-sm" color="onSurfaceVariant" style={{ marginLeft: 4 }}>in prizes</Text>
                      </View>

                      {/* Tags */}
                      <View style={styles.tagsRow}>
                        {spot.tags.map((t) => (
                          <View key={t} style={[styles.tag, { backgroundColor: theme.surfaceContainerHigh }]}>
                            <Text variant="label-xs" color="onSurfaceVariant">{t}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                        <Button 
                          title="Register with SquadUp Team" 
                          style={{ flex: 1 }} 
                          onPress={() => Alert.alert('Registration', 'Redirecting to event registration...')} 
                        />
                        <TouchableOpacity 
                          style={[styles.shareBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                          onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
                        >
                          <Ionicons name="share-outline" size={20} color={theme.onSurface} />
                        </TouchableOpacity>
                      </View>

                      <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center' }}>
                        {spot.attendees.toLocaleString()} registered{spot.attendees > 800 ? ' · High demand' : ''}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
            />

            {/* Carousel Dots */}
            {activeSpotlights.length > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                {activeSpotlights.map((_, i) => (
                  <View 
                    key={i} 
                    style={{ 
                      width: i === validIndex ? 18 : 6, 
                      height: 6, 
                      borderRadius: 3, 
                      backgroundColor: i === validIndex ? theme.primary : theme.surfaceContainerHighest 
                    }} 
                  />
                ))}
              </View>
            )}
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
                  <Image source={{ uri: ev.posterUrl }} style={styles.eventIcon} resizeMode="cover" />
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
  catScroll: { flexGrow: 0, marginBottom: 4, flexShrink: 0 },
  catRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  catTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spotlightCard: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
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
