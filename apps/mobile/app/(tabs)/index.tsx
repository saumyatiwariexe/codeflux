import React from 'react';
import { ScrollView, View, StyleSheet, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

export default function HomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surfaceSpaceDeep + 'cc' }]}>
        <View style={styles.headerTitleContainer}>
          <Text variant="headline-sm" style={{ tracking: -0.5 }}>Campus Pulse</Text>
          <View style={styles.activeIndicatorContainer}>
            <View style={[styles.activeDot, { backgroundColor: theme.neonEmerald }]} />
            <Text variant="label-sm" color="onSurfaceVariant">LPU Active · 28°C</Text>
          </View>
        </View>
        {/* Placeholder for Notifications and Profile Avatars */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stories Bar placeholder */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          <View style={styles.storyItem}>
            <View style={[styles.storyCircle, { backgroundColor: theme.surfaceContainerHigh }]}>
               <Text variant="headline-md" color="primary">+</Text>
            </View>
            <Text variant="label-sm" color="onSurfaceVariant">Your Pulse</Text>
          </View>
          <View style={styles.storyItem}>
             <View style={[styles.storyCircle, { borderColor: theme.secondary, borderWidth: 2 }]} />
             <Text variant="label-sm">HackLPU</Text>
          </View>
        </ScrollView>

        {/* Hero Event Card */}
        <Card variant="default" style={styles.heroCard}>
          <View style={[styles.heroImagePlaceholder, { backgroundColor: theme.primaryContainer }]} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <Badge label="LIVE NOW" variant="notification" />
              <Text variant="label-sm" color="onSurfaceVariant" style={{ marginLeft: 8 }}>842 Attending</Text>
            </View>
            <Text variant="headline-lg" style={{ marginTop: 12 }}>HackLPU 2026 Opening</Text>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>
              Keynote kickoff, mentor matchmaking, and reveal of the $15,000 algorithmic innovation challenges.
            </Text>
            <View style={styles.heroActions}>
              <Button title="Join Stream" style={{ flex: 1 }} />
            </View>
          </View>
        </Card>

        {/* Quests Section */}
        <Card variant="glass" style={styles.questCard}>
           <View style={styles.questHeader}>
             <View>
               <Text variant="label-sm" color="onSurfaceVariant">PULSE LEVEL 4</Text>
               <Text variant="headline-sm">Campus Regular</Text>
             </View>
             <Badge label="🔥 6-Day Streak" variant="squad" />
           </View>
           <View style={[styles.questProgress, { backgroundColor: theme.surfaceContainer }]}>
             <Text variant="headline-sm">350 / 500 XP</Text>
             <Text variant="label-sm" color="neonEmerald">+150 XP to Lvl 5</Text>
           </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  activeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24,
  },
  storiesContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: 8,
  },
  heroImagePlaceholder: {
    height: 140,
    width: '100%',
  },
  heroContent: {
    padding: 20,
    marginTop: -20,
    zIndex: 2,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  questCard: {
    padding: 20,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questProgress: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
