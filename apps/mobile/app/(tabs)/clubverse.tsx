import React from 'react';
import { ScrollView, View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

export default function ClubVerseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Horizontal Spaces Switcher */}
      <View style={styles.spacesSwitcher}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spacesScroll}>
          <View style={[styles.spacePill, { backgroundColor: theme.surfaceSpaceElevated }]}>
            <Text variant="label-md">GDG LPU</Text>
            <View style={[styles.dot, { backgroundColor: theme.neonEmerald }]} />
          </View>
          <View style={[styles.spacePill, { backgroundColor: theme.surfaceContainerLow }]}>
            <Text variant="label-md" color="onSurfaceVariant">Robotics Soc</Text>
          </View>
          <View style={[styles.spacePill, { backgroundColor: theme.surfaceContainerLow }]}>
            <Text variant="label-md" color="onSurfaceVariant">Design Guild</Text>
            <Badge label="3" variant="notification" />
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Club Profile Hero */}
        <Card variant="elevated" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={[styles.clubLogo, { backgroundColor: theme.surfaceContainer }]} />
            <View style={styles.heroTitle}>
              <Text variant="headline-sm">GDG on Campus</Text>
              <Text variant="body-sm" color="onSurfaceVariant">Lovely Professional University Chapter</Text>
            </View>
          </View>
          
          <View style={styles.tagsRow}>
            <Badge label="Open for Recruitment" variant="xp" />
            <Badge label="EduRevolution Tier A" variant="squad" />
          </View>

          <View style={styles.metricsRow}>
             <View style={[styles.metricBox, { backgroundColor: theme.surfaceContainerLow }]}>
               <Text variant="headline-sm">1,420</Text>
               <Text variant="label-sm" color="onSurfaceVariant">Members</Text>
             </View>
             <View style={[styles.metricBox, { backgroundColor: theme.surfaceContainerLow }]}>
               <Text variant="headline-sm">38</Text>
               <Text variant="label-sm" color="onSurfaceVariant">Events Hosted</Text>
             </View>
             <View style={[styles.metricBox, { backgroundColor: theme.surfaceContainerLow }]}>
               <Text variant="headline-sm" color="neonEmerald">4.9 ★</Text>
               <Text variant="label-sm" color="onSurfaceVariant">Reputation</Text>
             </View>
          </View>
        </Card>

        {/* Discord-style Channels */}
        <View style={styles.channelCategory}>
          <Text variant="label-sm" color="onSurfaceVariant" style={{ marginLeft: 8, marginBottom: 8 }}>OFFICIAL CHANNELS</Text>
          
          <Card variant="glass" style={styles.channelRow}>
            <View style={styles.channelHeader}>
              <Text variant="headline-sm"># announcements</Text>
              <Badge label="2 NEW" variant="notification" />
            </View>
            <Text variant="body-sm" color="onSurfaceVariant" numberOfLines={1}>HackLPU final briefing slides & rubric posted in files</Text>
          </Card>

          <Card variant="default" style={styles.channelRow}>
            <View style={styles.channelHeader}>
              <Text variant="headline-sm"># events-rsvp</Text>
            </View>
            <Text variant="body-sm" color="onSurfaceVariant" numberOfLines={1}>Google Cloud Study Jam Ticket Claims Open</Text>
          </Card>
        </View>

        <View style={styles.channelCategory}>
          <Text variant="label-sm" color="onSurfaceVariant" style={{ marginLeft: 8, marginBottom: 8 }}>DISCUSSIONS & STAGES</Text>
          
          {/* Live Voice Room */}
          <Card variant="elevated" style={styles.channelRow}>
            <View style={styles.channelHeader}>
              <Text variant="headline-sm">🔊 hackathon-lounge</Text>
              <Badge label="LIVE" variant="xp" />
            </View>
            <Text variant="label-sm" color="onSurfaceVariant">Stage Room</Text>
            <View style={styles.activeSpeakers}>
               <Text variant="label-sm" color="neonEmerald">Aarav speaking...</Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  spacesSwitcher: { paddingVertical: 12 },
  spacesScroll: { paddingHorizontal: 20, gap: 12 },
  spacePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  heroCard: { padding: 20, marginBottom: 24 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clubLogo: { width: 56, height: 56, borderRadius: 16 },
  heroTitle: { flex: 1 },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metricBox: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 12 },
  channelCategory: { marginBottom: 24 },
  channelRow: { padding: 16, marginBottom: 8 },
  channelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  activeSpeakers: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
});
