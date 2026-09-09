import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

export default function CampusVerseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Map Viewport Area (Fake Map for prototype) */}
      <View style={styles.mapContainer}>
        {/* We would use react-native-maps here in a real build. For now, a placeholder replicating the fog of war map */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceContainerLowest }]} />
        
        {/* Fake grid/roads overlay */}
        <View style={styles.mapGridOverlay}>
           <Text variant="display-hero" color="outlineVariant" style={{ opacity: 0.1 }}>LPU CAMPUS MAP</Text>
        </View>

        {/* Fog of war overlay */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceSpaceDeep, opacity: 0.85 }]} />

        {/* Top Overlay Controls */}
        <View style={styles.topControls}>
          <View style={[styles.searchPill, { backgroundColor: theme.surfaceSpaceElevated }]}>
             <Text variant="body-md" color="onSurfaceVariant">Search block, lab room...</Text>
          </View>
          <View style={styles.filtersScroll}>
             <Badge label="All Layers" variant="squad" style={{ backgroundColor: theme.primary }} />
             <Badge label="Quests (3)" variant="squad" />
             <Badge label="Events (2)" variant="squad" />
          </View>
        </View>

        {/* Fake Pins */}
        <View style={[styles.pin, { top: '40%', left: '30%' }]}>
           <Badge label="Live Fest" variant="notification" />
        </View>
        <View style={[styles.pin, { top: '60%', left: '60%' }]}>
           <Badge label="+150 XP" variant="xp" />
        </View>

      </View>

      {/* Bottom Drawer Quest Tracker */}
      <View style={styles.bottomDrawer}>
        <Card variant="elevated" style={styles.questTrackerCard}>
          <View style={styles.drawerHandle} />
          <View style={styles.questHeader}>
             <Badge label="ACTIVE QUEST" variant="xp" />
             <Text variant="label-sm" color="onSurfaceVariant">12m left</Text>
          </View>
          <Text variant="headline-sm">Locate Block 34 Mac Lab</Text>
          <Text variant="body-sm" color="onSurfaceVariant">Navigate to the iOS development lab to claim your daily check-in XP.</Text>
          
          <View style={[styles.radarBox, { backgroundColor: theme.surfaceContainer }]}>
             <Text variant="headline-sm" color="primary">84m away</Text>
             <Text variant="label-sm" color="onSurfaceVariant">Walk North-East</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapGridOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  topControls: { position: 'absolute', top: 16, left: 20, right: 20, zIndex: 10, gap: 12 },
  searchPill: { height: 48, borderRadius: 24, justifyContent: 'center', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  filtersScroll: { flexDirection: 'row', gap: 8 },
  pin: { position: 'absolute', zIndex: 20 },
  bottomDrawer: { position: 'absolute', bottom: 90, left: 20, right: 20, zIndex: 30 },
  questTrackerCard: { padding: 16 },
  drawerHandle: { width: 40, height: 4, backgroundColor: '#888', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  radarBox: { marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
});
