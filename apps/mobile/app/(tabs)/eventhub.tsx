import React from 'react';
import { ScrollView, View, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

export default function EventHubScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <View style={styles.header}>
        <TextInput 
          style={[styles.searchInput, { backgroundColor: theme.surfaceSpaceElevated, color: theme.onSurface }]} 
          placeholder="Search hackathons, case comps..." 
          placeholderTextColor={theme.onSurfaceVariant}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Button variant="primary" title="All Competitions" style={styles.filterPill} />
          <Button variant="secondary" title="Hackathons" style={styles.filterPill} />
          <Button variant="secondary" title="Cultural" style={styles.filterPill} />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Spotlight Challenge */}
        <View style={styles.sectionHeader}>
          <Text variant="headline-sm">Spotlight Challenge</Text>
          <Text variant="label-sm" color="secondary">Closing in 48h</Text>
        </View>

        <Card variant="elevated" style={styles.spotlightCard}>
          <View style={[styles.bannerPlaceholder, { backgroundColor: theme.surfaceContainerHigh }]} />
          <View style={styles.spotlightContent}>
            <Text variant="label-sm" color="onSurfaceVariant">School of Computer Science & DSW</Text>
            <Text variant="headline-lg" style={{ marginTop: 4 }}>HackLPU 2026: The National Innovation Odyssey</Text>
            
            <View style={styles.metaRow}>
               <View style={[styles.metaBox, { backgroundColor: theme.surfaceContainerLow }]}>
                 <Text variant="label-sm" color="onSurfaceVariant">Deadline</Text>
                 <Text variant="label-md">2 Days Left</Text>
               </View>
               <View style={[styles.metaBox, { backgroundColor: theme.surfaceContainerLow }]}>
                 <Text variant="label-sm" color="onSurfaceVariant">Team Size</Text>
                 <Text variant="label-md">2-4 Minds</Text>
               </View>
               <View style={[styles.metaBox, { backgroundColor: theme.surfaceContainerLow }]}>
                 <Text variant="label-sm" color="onSurfaceVariant">Fee</Text>
                 <Text variant="label-md" color="neonEmerald">Free Entry</Text>
               </View>
            </View>

            <Button title="Apply with SquadUp Team" style={{ marginTop: 16 }} />
          </View>
        </Card>

        {/* Active Challenges List */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text variant="headline-sm">Active Challenges</Text>
          <Text variant="label-sm" color="onSurfaceVariant">24 Active</Text>
        </View>

        <Card variant="default" style={styles.listCard}>
          <View style={styles.listCardHeader}>
            <View style={[styles.listIcon, { backgroundColor: theme.surfaceContainerHigh }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Badge label="EduRev Tier 1" variant="xp" />
              <Text variant="headline-sm">RoboQuest: Autonomous Nav</Text>
              <Text variant="body-sm" color="onSurfaceVariant">Robotics Club</Text>
            </View>
            <Text variant="label-md" color="accentGold">₹75,000</Text>
          </View>
        </Card>

        <Card variant="default" style={styles.listCard}>
          <View style={styles.listCardHeader}>
            <View style={[styles.listIcon, { backgroundColor: theme.surfaceContainerHigh }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Badge label="🔥 Teammates Wanted" variant="notification" />
              <Text variant="headline-sm">DesignThon: AI UI/UX Sprint</Text>
              <Text variant="body-sm" color="onSurfaceVariant">HCI Society</Text>
            </View>
            <Text variant="label-md" color="accentGold">₹50,000</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, gap: 12 },
  searchInput: { height: 48, borderRadius: 24, paddingHorizontal: 16 },
  filterScroll: { gap: 8 },
  filterPill: { height: 36 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  spotlightCard: { overflow: 'hidden' },
  bannerPlaceholder: { height: 140 },
  spotlightContent: { padding: 20 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metaBox: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  listCard: { padding: 16, marginBottom: 12 },
  listCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  listIcon: { width: 48, height: 48, borderRadius: 12 },
});
