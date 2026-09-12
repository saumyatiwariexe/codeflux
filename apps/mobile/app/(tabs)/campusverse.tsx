import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, useColorScheme, TouchableOpacity, Animated, Dimensions, ScrollView, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useThemeStore } from '../../stores/useThemeStore';
import { MapCanvas } from '../../components/map/MapCanvas';
import { LIVE_EVENTS, MAP_QUESTS } from '../../constants/mapData';
import { Ionicons } from '@expo/vector-icons';


const { width: W, height: H } = Dimensions.get('window');

// ---- Mock LPU Campus zones (simulated map) ----
const CAMPUS_ZONES = [
  { id: 'tech', label: 'Tech District', emoji: '', x: 0.25, y: 0.3, revealed: true, color: '#6C63FF' },
  { id: 'sports', label: 'Sports Complex', emoji: '', x: 0.65, y: 0.2, revealed: true, color: '#43E97B' },
  { id: 'hostel', label: 'Hostel Zone', emoji: '', x: 0.7, y: 0.6, revealed: false, color: '#F59E0B' },
  { id: 'library', label: 'Central Library', emoji: '', x: 0.4, y: 0.5, revealed: true, color: '#60A5FA' },
  { id: 'food', label: 'Food Court', emoji: '', x: 0.2, y: 0.65, revealed: false, color: '#F97316' },
  { id: 'admin', label: 'Main Admin', emoji: '', x: 0.5, y: 0.2, revealed: true, color: '#EC4899' },
];

const MAP_PINS = [
  { id: 'p1', type: 'event', label: 'HackLPU', x: 0.35, y: 0.35, color: '#FF6584', emoji: '' },
  { id: 'p2', type: 'quest', label: '+150 XP', x: 0.62, y: 0.48, color: '#43E97B', emoji: '' },
  { id: 'p3', type: 'event', label: 'Diwali Fest', x: 0.5, y: 0.6, color: '#F59E0B', emoji: '' },
];

type MapLayer = 'all' | 'quests' | 'events' | 'clubs';

export default function CampusVerseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');

  // Pulse animations for pins
  const pinPulse = useRef(new Animated.Value(1)).current;
  const fogOpacity = useRef(new Animated.Value(0.82)).current;
  const drawerY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse live event pins
    Animated.loop(
      Animated.sequence([
        Animated.timing(pinPulse, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pinPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Subtle fog breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(fogOpacity, { toValue: 0.78, duration: 3000, useNativeDriver: true }),
        Animated.timing(fogOpacity, { toValue: 0.85, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const MAP_H = H * 0.58;

  const visiblePins = MAP_PINS.filter((p) => {
    if (activeLayer === 'all') return true;
    if (activeLayer === 'quests') return p.type === 'quest';
    if (activeLayer === 'events') return p.type === 'event';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0B12' }]} edges={['top']}>

      {/* === MAP VIEWPORT === */}
      <View style={[styles.mapContainer, { height: MAP_H }]}>
        <MapCanvas activeLayer={activeLayer} />

        {/* ---- Top controls ---- */}
        <View style={styles.topControls}>
          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.surfaceSpaceElevated + 'F2' }]}>
            <Text style={{ fontSize: 14 }}></Text>
            <Text variant="body-sm" color="onSurfaceVariant"> Search block, lab, room...</Text>
          </View>
          {/* Layer filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {(['all', 'quests', 'events', 'clubs'] as MapLayer[]).map((layer) => (
                <TouchableOpacity
                  key={layer}
                  style={[styles.filterChip, { backgroundColor: activeLayer === layer ? theme.primary : theme.surfaceContainerLow + 'E0' }]}
                  onPress={() => setActiveLayer(layer)}
                >
                  <Text variant="label-sm" style={{ color: activeLayer === layer ? theme.onPrimary : theme.onSurfaceVariant }}>
                  {layer === 'all' ? 'All' : layer === 'quests' ? `Quests (${MAP_QUESTS.filter(q => !q.completed).length})` : layer === 'events' ? `Events (${LIVE_EVENTS.filter(e => e.type === 'event').length})` : 'Clubs'}

                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ---- XP Fog stats (top right) ---- */}
        <View style={[styles.fogStats, { backgroundColor: theme.surfaceSpaceElevated + 'E0' }]}>
          <Text variant="label-xs" color="onSurfaceVariant">DISCOVERED</Text>
          <Text variant="headline-sm" color="primary">4/12</Text>
          <Text variant="label-xs" color="onSurfaceVariant">ZONES</Text>
        </View>
      </View>

      {/* === BOTTOM QUEST DRAWER === */}
      <ScrollView
        style={[styles.drawer, { backgroundColor: theme.surfaceSpaceDeep }]}
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.drawerHandle, { backgroundColor: theme.outlineVariant }]} />



        {/* Active Quests preview */}
        <Text variant="headline-sm" style={{ marginTop: 20, marginBottom: 12 }}>Active Quests</Text>
        {MAP_QUESTS.filter(q => !q.completed).slice(0, 3).map((q) => {
          const COLORS: Record<string, string> = { explorer: '#43E97B', academic: '#60A5FA', social: '#F59E0B', challenge: '#FF6584', daily: '#A78BFA' };
          const color = COLORS[q.type] ?? theme.primary;
          return (
            <View key={q.id} style={[styles.nearbyRow, { marginBottom: 10, backgroundColor: theme.surfaceContainerLow + 'CC', borderRadius: 14, padding: 14 }]}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color + '60' }}>
                <Ionicons name="flag" size={16} color={color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="headline-sm" numberOfLines={1}>{q.title}</Text>
                <Text variant="label-xs" color="onSurfaceVariant">{q.xp} XP · {q.difficulty} · {q.timeLimit ?? 'No deadline'}</Text>
              </View>
            </View>
          );
        })}

        {/* Nearby Events */}
        <Text variant="headline-sm" style={{ marginTop: 20, marginBottom: 12 }}>Nearby Events</Text>
        {LIVE_EVENTS.slice(0, 3).map((ev, i) => (
          <Card key={ev.id} variant="default" style={[styles.nearbyCard, { padding: 0, overflow: 'hidden' }]}>
            {ev.posterUrl && (
              <Image source={{ uri: ev.posterUrl }} style={{ width: '100%', height: 120, resizeMode: 'cover' }} />
            )}
            <View style={[styles.nearbyRow, { padding: 14 }]}>
              <Ionicons name="location-sharp" size={28} color={theme.error} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="headline-sm">{ev.title}</Text>
                <Text variant="label-sm" color="onSurfaceVariant">Happening Now · {Math.floor(Math.random() * 500 + 50)}m away</Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
  zoneBlobWrapper: { position: 'absolute' },
  zoneBlob: { width: 80, height: 80, borderRadius: 40, borderWidth: 1 },
  zoneLabel: { position: 'absolute', zIndex: 15 },
  zoneLabelInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1,
  },
  pinContainer: { position: 'absolute', zIndex: 20, alignItems: 'center' },
  pulsRing: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, top: -8,
  },
  pinBubble: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  pinStem: { width: 2, height: 8, marginTop: 2 },
  playerDot: { position: 'absolute', zIndex: 25, width: 16, height: 16 },
  playerPulse: {
    position: 'absolute', width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, top: -6, left: -6,
  },
  playerCenter: { width: 14, height: 14, borderRadius: 7, top: 1, left: 1 },
  topControls: { position: 'absolute', top: 12, left: 16, right: 16, zIndex: 30, gap: 10 },
  searchBar: {
    height: 44, borderRadius: 22, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fogStats: {
    position: 'absolute', top: 12, right: 16, zIndex: 30,
    padding: 10, borderRadius: 14, alignItems: 'center',
  },
  drawer: { flex: 1 },
  drawerContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  drawerHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  activeQuestCard: { padding: 16 },
  questCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  radarBox: { marginTop: 14, padding: 14, borderRadius: 12, alignItems: 'center', gap: 2 },
  nearbyCard: { padding: 14, marginBottom: 10 },
  nearbyRow: { flexDirection: 'row', alignItems: 'center' },
});
