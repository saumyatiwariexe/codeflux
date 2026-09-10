import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ScrollView, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

const SKILL_CATEGORIES: Record<string, string[]> = {
  ' Tech': [
    'React', 'React Native', 'Next.js', 'Node.js', 'Python', 'TypeScript',
    'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'FastAPI',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Solidity',
    'Unity', 'C#', 'C++', 'Rust', 'Go', 'ROS', 'Embedded Systems',
    'VLSI', 'Arduino', 'Penetration Testing', 'Bioinformatics',
  ],
  ' Design': ['Figma', 'Adobe XD', 'Illustrator', 'Motion Design', 'Branding', '3D Modeling'],
  ' Business': ['Product Management', 'Pitching', 'Marketing', 'Finance', 'Consulting'],
  ' Research': ['Research', 'R Language', 'MATLAB'],
  ' Arts & Sports': ['Photography', 'Music', 'Dance', 'Public Speaking', 'Cricket', 'Badminton'],
};

const MAX_SKILLS = 8;

export default function OnboardingSkillsScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [activeCategory, setActiveCategory] = useState(' Tech');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else if (selectedSkills.length < MAX_SKILLS) {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const canFinish = selectedSkills.length >= 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="label-sm" color="primary">STEP 2 OF 2</Text>
        <Text variant="headline-lg" style={{ marginTop: 8 }}>What are your superpowers?</Text>
        <Text variant="body-sm" color="onSurfaceVariant">
          Pick 2–{MAX_SKILLS} skills. This powers your SquadUp matches.
        </Text>
        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceContainerHigh, marginTop: 16 }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '100%' }]} />
        </View>
      </View>

      {/* Selected Skills Pills */}
      {selectedSkills.length > 0 && (
        <View style={styles.selectedRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedPills}>
              {selectedSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.selectedPill, { backgroundColor: theme.primary }]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text variant="label-sm" style={{ color: theme.onPrimary }}>{skill} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text variant="label-xs" color="onSurfaceVariant" style={{ textAlign: 'right', paddingRight: 16, marginTop: 4 }}>
            {selectedSkills.length}/{MAX_SKILLS}
          </Text>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        <View style={styles.tabsRow}>
          {Object.keys(SKILL_CATEGORIES).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, { backgroundColor: activeCategory === cat ? theme.primary : theme.surfaceContainerLow }]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text variant="label-sm" style={{ color: activeCategory === cat ? theme.onPrimary : theme.onSurface }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Skills Grid */}
      <ScrollView contentContainerStyle={styles.skillGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.pillGrid}>
          {(SKILL_CATEGORIES[activeCategory] ?? []).map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            const isDisabled = !isSelected && selectedSkills.length >= MAX_SKILLS;
            return (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillPill,
                  {
                    backgroundColor: isSelected ? theme.primaryContainer : theme.surfaceContainerLow,
                    borderColor: isSelected ? theme.primary : theme.glassBorder,
                    opacity: isDisabled ? 0.4 : 1,
                  },
                ]}
                onPress={() => toggleSkill(skill)}
                disabled={isDisabled}
              >
                <Text
                  variant="label-sm"
                  style={{ color: isSelected ? theme.onPrimaryContainer : theme.onSurface }}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Finish CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canFinish ? theme.neonEmerald : theme.surfaceContainerHigh }]}
          onPress={() => canFinish && router.replace('/(tabs)')}
          disabled={!canFinish}
        >
          <Text variant="label-lg" style={{ color: canFinish ? '#0B3D20' : theme.onSurfaceVariant }}>
            {canFinish ? ' Enter Paladeium' : `Pick ${2 - selectedSkills.length} more skill${selectedSkills.length === 1 ? '' : 's'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  progressTrack: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  selectedRow: { paddingLeft: 16, paddingVertical: 8 },
  selectedPills: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  selectedPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryTabs: { paddingLeft: 16, marginBottom: 8, flexGrow: 0 },
  tabsRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  skillGrid: { paddingHorizontal: 16, paddingBottom: 120 },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
