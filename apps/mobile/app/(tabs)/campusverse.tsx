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
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';


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
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Pulse animations for pins
  const pinPulse = useRef(new Animated.Value(1)).current;
  const fogOpacity = useRef(new Animated.Value(0.82)).current;
  const drawerY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      // Request Expo permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      // Crucial for Android: Mapbox demands its own native permission call
      // or the LocationManager will silently refuse to start.
      const isGrantedMapbox = await Mapbox.requestAndroidLocationPermissions();
      
      if (status === 'granted' || isGrantedMapbox) {
        setHasLocationPermission(true);
      }
    })();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0B12' }]} edges={['top']}>

      {/* === MAP VIEWPORT === */}
      <View style={[styles.mapContainer, { flex: 1 }]}>
        {hasLocationPermission ? (
          <MapCanvas activeLayer={activeLayer} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Acquiring GPS Signal...</Text>
          </View>
        )}

        {/* ---- Top controls ---- */}
        <View style={styles.topControls}>
          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.surfaceSpaceElevated + 'F2' }]}>
            <Text style={{ fontSize: 14 }}></Text>
            <Text variant="body-sm" color="onSurfaceVariant"> Search block, lab, room...</Text>
          </View>
        </View>

        {/* ---- XP Fog stats (top right) ---- */}
        <View style={[styles.fogStats, { backgroundColor: theme.surfaceSpaceElevated + 'E0' }]}>
          <Text variant="label-xs" color="onSurfaceVariant">DISCOVERED</Text>
          <Text variant="headline-sm" color="primary">4/12</Text>
          <Text variant="label-xs" color="onSurfaceVariant">ZONES</Text>
        </View>
      </View>
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
