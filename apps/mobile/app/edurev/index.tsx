import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity,
  TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';
import { edurevApi } from '../../services/api';

const CATEGORY_ICONS: Record<string, string> = {
  CERTIFICATION: 'ribbon',
  COMPETITION_WIN: 'trophy',
  RESEARCH_PAPER: 'document-text',
  PATENT: 'bulb',
  INTERNSHIP: 'briefcase',
  STARTUP: 'rocket',
  MOOC: 'school',
};

const MOCK_ACHIEVEMENTS = [
  {
    id: 'a1', category: 'CERTIFICATION', title: 'AWS Cloud Practitioner',
    description: 'Passed with 90% score.', status: 'approved',
    attendanceRelaxation: 5, gradeBenefit: 'Grade improvement in Cloud Computing',
    xpAwarded: 200, submittedAt: '2026-08-26',
  },
  {
    id: 'a2', category: 'COMPETITION_WIN', title: '2nd Place — VIT National Hackathon',
    description: 'Built AI campus safety system. Team of 4. Won ₹50,000.',
    status: 'approved', attendanceRelaxation: 8, xpAwarded: 500,
    submittedAt: '2026-07-11',
  },
  {
    id: 'a3', category: 'RESEARCH_PAPER', title: 'Paper: Efficient Transformers for Edge Devices',
    description: 'Accepted at IEEE ICISC 2026.',
    status: 'pending', submittedAt: '2026-09-05',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  CERTIFICATION: 'Certification',
  COMPETITION_WIN: 'Competition Win',
  RESEARCH_PAPER: 'Research Paper',
  PATENT: 'Patent',
  INTERNSHIP: 'Internship',
  STARTUP: 'Startup',
  MOOC: 'Online Course',
};

const STATUS_COLOR = {
  approved: '#43E97B',
  pending: '#F59E0B',
  rejected: '#EF4444',
};

export default function EduRevScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  const [showLogModal, setShowLogModal] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const totalRelaxation = MOCK_ACHIEVEMENTS
    .filter((a) => a.status === 'approved')
    .reduce((s, a) => s + (a.attendanceRelaxation ?? 0), 0);

  const totalXp = MOCK_ACHIEVEMENTS
    .filter((a) => a.status === 'approved')
    .reduce((s, a) => s + (a.xpAwarded ?? 0), 0);

  const handleLogAchievement = async () => {
    if (!achTitle.trim() || !achDesc.trim()) return;
    setIsSubmitting(true);
    const res = await edurevApi.logAchievement({ title: achTitle, description: achDesc });
    setIsSubmitting(false);
    if (res.success && res.data) {
      setAiResult(CATEGORY_LABELS[res.data.category] ?? res.data.category);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headline-md">EduRevolution</Text>
          <Text variant="body-sm" color="onSurfaceVariant">LPU achievement tracker</Text>
        </View>
        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: theme.primary }]}
          onPress={() => setShowLogModal(true)}
        >
          <Ionicons name="add" size={16} color={theme.onPrimary} />
          <Text variant="label-sm" style={{ color: theme.onPrimary, marginLeft: 4 }}>Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- Benefits Summary ---- */}
        <Card variant="glass" style={styles.summaryCard}>
          <Text variant="label-sm" color="onSurfaceVariant">YOUR BENEFITS SUMMARY</Text>
          <View style={styles.benefitsRow}>
            <View style={styles.benefitBox}>
              <Text variant="display-hero" style={{ color: theme.neonEmerald }}>{totalRelaxation}%</Text>
              <Text variant="label-sm" color="onSurfaceVariant">Attendance{'\n'}Relaxation</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
            <View style={styles.benefitBox}>
              <Text variant="display-hero" style={{ color: theme.primary }}>{totalXp.toLocaleString()}</Text>
              <Text variant="label-sm" color="onSurfaceVariant">XP Earned{'\n'}from EduRev</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
            <View style={styles.benefitBox}>
              <Text variant="display-hero" style={{ color: theme.accentGold }}>{MOCK_ACHIEVEMENTS.filter(a => a.status === 'approved').length}</Text>
              <Text variant="label-sm" color="onSurfaceVariant">Approved{'\n'}Achievements</Text>
            </View>
          </View>

          {/* Warning if near cap */}
          {totalRelaxation >= 20 && (
            <View style={[styles.capWarning, { backgroundColor: theme.accentGold + '22', flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <Ionicons name="warning" size={16} color={theme.accentGold} />
              <Text variant="label-sm" style={{ color: theme.accentGold, flex: 1 }}>
                You're near the LPU 25% relaxation cap ({totalRelaxation}% used)
              </Text>
            </View>
          )}
        </Card>

        {/* ---- Timeline ---- */}
        <Text variant="headline-sm" style={{ marginTop: 8 }}>Achievement Timeline</Text>

        {MOCK_ACHIEVEMENTS.map((ach) => (
          <Card key={ach.id} variant="default" style={styles.achCard}>
            <View style={styles.achTop}>
              <View style={[styles.achIcon, { backgroundColor: theme.primaryContainer }]}>
                <Ionicons name={(CATEGORY_ICONS[ach.category] ?? 'star') as any} size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.achHeader}>
                  <Badge
                    label={CATEGORY_LABELS[ach.category] ?? ach.category}
                    variant="xp"
                  />
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[ach.status as keyof typeof STATUS_COLOR] ?? '#9CA3AF' }]} />
                  <Text variant="label-xs" style={{ color: STATUS_COLOR[ach.status as keyof typeof STATUS_COLOR] ?? '#9CA3AF' }}>
                    {ach.status.charAt(0).toUpperCase() + ach.status.slice(1)}
                  </Text>
                </View>
                <Text variant="headline-sm" style={{ marginTop: 6 }}>{ach.title}</Text>
                <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>{ach.description}</Text>
              </View>
            </View>

            {ach.status === 'approved' && (
              <View style={styles.benefitsChips}>
                {ach.attendanceRelaxation && (
                  <View style={[styles.chip, { backgroundColor: theme.neonEmerald + '22' }]}>
                    <Text variant="label-sm" style={{ color: theme.neonEmerald }}> +{ach.attendanceRelaxation}% Attendance</Text>
                  </View>
                )}
                {ach.xpAwarded && (
                  <View style={[styles.chip, { backgroundColor: theme.accentGold + '22' }]}>
                    <Text variant="label-sm" style={{ color: theme.accentGold }}> +{ach.xpAwarded} XP</Text>
                  </View>
                )}
              </View>
            )}

            <Text variant="label-xs" color="onSurfaceVariant" style={{ marginTop: 10 }}>
              Submitted {ach.submittedAt}
            </Text>
          </Card>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ---- Log Achievement Modal ---- */}
      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modal, { backgroundColor: theme.surfaceSpaceElevated }]}>
            <Text variant="headline-sm">Log New Achievement</Text>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>
              Describe your achievement and our AI will classify it automatically.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder, marginTop: 20 }]}
              placeholder="Title (e.g. AWS Certified, Won HackLPU)"
              placeholderTextColor={theme.onSurfaceVariant}
              value={achTitle}
              onChangeText={setAchTitle}
            />
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder, marginTop: 10 }]}
              placeholder="Describe the achievement in detail..."
              placeholderTextColor={theme.onSurfaceVariant}
              value={achDesc}
              onChangeText={setAchDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {aiResult && (
              <View style={[styles.aiResult, { backgroundColor: theme.primaryContainer, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Ionicons name="sparkles" size={16} color={theme.primary} />
                <Text variant="label-sm" style={{ color: theme.primary }}>
                  AI classified as: <Text variant="label-md" style={{ color: theme.primary }}>{aiResult}</Text>
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => { setShowLogModal(false); setAiResult(null); setAchTitle(''); setAchDesc(''); }}
              >
                <Text variant="label-sm" color="onSurfaceVariant">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary, flex: 1 }]}
                onPress={handleLogAchievement}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <ActivityIndicator color={theme.onPrimary} />
                  : <Text variant="label-sm" style={{ color: theme.onPrimary }}>{aiResult ? 'Submit for Review' : 'AI Classify'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  summaryCard: { padding: 20 },
  benefitsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  benefitBox: { flex: 1, alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 56 },
  capWarning: { marginTop: 14, padding: 10, borderRadius: 10 },
  achCard: { padding: 16 },
  achTop: { flexDirection: 'row', gap: 14 },
  achIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  achHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  benefitsChips: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  input: { height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter', borderWidth: 1 },
  textarea: { height: 100, paddingTop: 14 },
  aiResult: { padding: 12, borderRadius: 12, marginTop: 12 },
  modalBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
