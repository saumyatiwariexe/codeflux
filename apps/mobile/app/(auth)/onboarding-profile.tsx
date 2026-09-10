import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

const DEPARTMENTS = [
  'CSE', 'CSE (AI & ML)', 'CSE (Cloud)', 'CSE (Cyber Security)', 'CSE (Gaming)',
  'ECE', 'Mechanical', 'Civil', 'BioTech', 'Design', 'MBA', 'B.Com', 'B.Sc',
  'Law', 'Architecture', 'Pharmacy', 'Nursing',
];

const YEARS = [1, 2, 3, 4, 5, 6];
const DEGREE_LEVELS = ['UG', 'PG', 'PhD'];

export default function OnboardingProfileScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [degree, setDegree] = useState<string>('UG');
  const [isDayScholar, setIsDayScholar] = useState<boolean | null>(null);
  const [hostelBlock, setHostelBlock] = useState('');

  const canContinue = displayName.trim() && handle.trim() && department && year !== null && isDayScholar !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="label-sm" color="primary">STEP 1 OF 2</Text>
          <Text variant="headline-lg" style={{ marginTop: 8 }}>Tell us about yourself</Text>
          <Text variant="body-sm" color="onSurfaceVariant">This shows on your Paladeium profile</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceContainerHigh }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '50%' }]} />
        </View>

        {/* Full Name */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">FULL NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder }]}
            placeholder="Aarav Sharma"
            placeholderTextColor={theme.onSurfaceVariant}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Handle */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">USERNAME (@handle)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder }]}
            placeholder="aarav_sharma"
            placeholderTextColor={theme.onSurfaceVariant}
            value={handle}
            onChangeText={(v) => setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            autoCapitalize="none"
          />
        </View>

        {/* Department */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">DEPARTMENT / PROGRAMME</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={styles.chipRow}>
              {DEPARTMENTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, { backgroundColor: department === d ? theme.primary : theme.surfaceContainerLow, borderColor: department === d ? theme.primary : theme.glassBorder }]}
                  onPress={() => setDepartment(d)}
                >
                  <Text variant="label-sm" style={{ color: department === d ? theme.onPrimary : theme.onSurface }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Degree Level */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">DEGREE LEVEL</Text>
          <View style={styles.chipRow}>
            {DEGREE_LEVELS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, { backgroundColor: degree === d ? theme.primary : theme.surfaceContainerLow, borderColor: degree === d ? theme.primary : theme.glassBorder }]}
                onPress={() => setDegree(d)}
              >
                <Text variant="label-sm" style={{ color: degree === d ? theme.onPrimary : theme.onSurface }}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Year */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">CURRENT YEAR</Text>
          <View style={styles.chipRow}>
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.chip, styles.yearChip, { backgroundColor: year === y ? theme.primary : theme.surfaceContainerLow, borderColor: year === y ? theme.primary : theme.glassBorder }]}
                onPress={() => setYear(y)}
              >
                <Text variant="label-sm" style={{ color: year === y ? theme.onPrimary : theme.onSurface }}>Year {y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day Scholar / Hosteller */}
        <View style={styles.field}>
          <Text variant="label-sm" color="onSurfaceVariant">I AM A...</Text>
          <View style={styles.chipRow}>
            {[{ label: ' Day Scholar', val: true }, { label: ' Hosteller', val: false }].map(({ label, val }) => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.chip, { flex: 1, justifyContent: 'center', backgroundColor: isDayScholar === val ? theme.primary : theme.surfaceContainerLow, borderColor: isDayScholar === val ? theme.primary : theme.glassBorder }]}
                onPress={() => setIsDayScholar(val)}
              >
                <Text variant="label-sm" style={{ color: isDayScholar === val ? theme.onPrimary : theme.onSurface, textAlign: 'center' }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hostel block (conditional) */}
        {isDayScholar === false && (
          <View style={styles.field}>
            <Text variant="label-sm" color="onSurfaceVariant">HOSTEL BLOCK (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder }]}
              placeholder="e.g. Block 32"
              placeholderTextColor={theme.onSurfaceVariant}
              value={hostelBlock}
              onChangeText={setHostelBlock}
            />
          </View>
        )}

        {/* Continue CTA */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canContinue ? theme.primary : theme.surfaceContainerHigh }]}
          onPress={() => canContinue && router.push('/(auth)/onboarding-skills')}
          disabled={!canContinue}
        >
          <Text variant="label-lg" style={{ color: canContinue ? theme.onPrimary : theme.onSurfaceVariant }}>
            Next: Add Skills →
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 20 },
  header: { gap: 4 },
  progressTrack: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  field: { gap: 8 },
  input: { height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter', borderWidth: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  yearChip: {},
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
