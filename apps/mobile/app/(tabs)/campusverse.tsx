import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, useColorScheme, TouchableOpacity, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { MapCanvas } from '../../components/map/MapCanvas';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';

const { width: W, height: H } = Dimensions.get('window');

type MapLayer = 'all' | 'quests' | 'events' | 'clubs';
type MapMode = '3rd-person' | 'world-map';

export default function CampusVerseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');
  const [mapMode, setMapMode] = useState<MapMode>('3rd-person');
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [initialCoords, setInitialCoords] = useState<[number, number] | null>(null);

  // Radar scanning animation
  const radarSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      // Request Expo permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      // Crucial for Android: Mapbox demands its own native permission call
      const isGrantedMapbox = await Mapbox.requestAndroidLocationPermissions();
      
      if (status === 'granted' || isGrantedMapbox) {
        setHasLocationPermission(true);
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setInitialCoords([loc.coords.longitude, loc.coords.latitude]);
        } catch (e) {
          console.warn("Could not get initial location, falling back.");
          setInitialCoords([75.7051, 31.2560]);
        }
      }
    })();

    // Radar scan loop
    Animated.loop(
      Animated.timing(radarSpin, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spinInterpolation = radarSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0B12' }]} edges={['top']}>

      {/* === MAP VIEWPORT === */}
      <View style={[styles.mapContainer, { flex: 1 }]}>
        {hasLocationPermission && initialCoords ? (
          <MapCanvas activeLayer={activeLayer} mapMode={mapMode} initialCoords={initialCoords} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Acquiring GPS Signal...</Text>
          </View>
        )}

        {/* ---- Top controls ---- */}
        {mapMode === '3rd-person' && (
          <View style={styles.topControls}>
            <View style={[styles.searchBar, { backgroundColor: theme.surfaceSpaceElevated + 'F2' }]}>
              <Ionicons name="search" size={16} color={theme.onSurfaceVariant} />
              <Text variant="body-sm" color="onSurfaceVariant"> Search block, lab, room...</Text>
            </View>
          </View>
        )}

        {/* ---- Close Map Button (World Map Mode) ---- */}
        {mapMode === 'world-map' && (
          <View style={styles.worldMapControls}>
            <TouchableOpacity 
              style={[styles.closeMapBtn, { backgroundColor: theme.surfaceSpaceElevated }]}
              onPress={() => setMapMode('3rd-person')}
            >
              <Ionicons name="close" size={24} color={theme.primary} />
              <Text variant="label-md" style={{ marginLeft: 8 }}>Close Map</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ---- Corner Radar UI (3rd-person mode) ---- */}
        {mapMode === '3rd-person' && (
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.radarContainer, { borderColor: theme.outlineVariant, backgroundColor: 'rgba(10,11,18,0.7)' }]}
            onPress={() => setMapMode('world-map')}
          >
            {/* The scanning sweep line */}
            <Animated.View style={[styles.radarSweepContainer, { transform: [{ rotate: spinInterpolation }] }]}>
              <View style={styles.radarSweepWedge} />
            </Animated.View>
            
            {/* Dummy glowing blips to represent nearby activities */}
            <View style={[styles.radarBlip, { backgroundColor: '#3b82f6', top: '25%', left: '70%' }]} />
            <View style={[styles.radarBlip, { backgroundColor: '#10b981', top: '60%', left: '20%' }]} />
            <View style={[styles.radarBlip, { backgroundColor: '#FF6584', top: '80%', left: '75%', width: 6, height: 6 }]} />
            
            {/* Player center dot */}
            <View style={[styles.radarCenter, { backgroundColor: theme.primary }]} />
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { position: 'relative', overflow: 'hidden' },
  topControls: { position: 'absolute', top: 12, left: 16, right: 16, zIndex: 30, gap: 10 },
  worldMapControls: { position: 'absolute', top: 12, right: 16, zIndex: 30 },
  searchBar: {
    height: 44, borderRadius: 22, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  closeMapBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  radarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    overflow: 'hidden',
    zIndex: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarSweepContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  radarSweepWedge: {
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(67, 233, 123, 0.15)',
    borderRightWidth: 2,
    borderRightColor: 'rgba(67, 233, 123, 0.8)',
    marginLeft: '50%',
  },
  radarCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  radarBlip: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});
