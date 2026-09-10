import React from 'react';
import { View, StyleSheet, Dimensions, useColorScheme, ScrollView } from 'react-native';
import { Text } from '../ui/Text';
import { Avatar } from '../ui/Avatar';
import { SkillTag } from '../profile/SkillTag';
import { useThemeStore } from '../../stores/useThemeStore';

const { width: SCREEN_W } = Dimensions.get('window');

export interface SwipeCardData {
  id: string;
  displayName: string;
  handle: string;
  department: string;
  year: number;
  bio?: string;
  matchScore: number;
  skills?: Array<{ skill: { name: string }; proficiency: 'beginner' | 'intermediate' | 'expert' }>;
  campusXp?: number;
  level?: number;
  prompts?: Array<{ question: string; answer: string }>;
}

interface SwipeCardProps {
  data: SwipeCardData;
}

export function SwipeCard({ data }: SwipeCardProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Huge Header Avatar Block */}
      <View style={[styles.headerBlock, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder }]}>
        <Avatar displayName={data.displayName} size={SCREEN_W * 0.5} />
        <View style={styles.headerInfo}>
          <Text style={[styles.nameText, { color: theme.onSurface }]}>{data.displayName}</Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            @{data.handle} · {data.department} · Year {data.year}
          </Text>
          <View style={[styles.matchBadge, { backgroundColor: theme.primaryContainer }]}>
            <Text variant="label-sm" style={{ color: theme.primary }}>{data.matchScore}% Synergy</Text>
          </View>
        </View>
      </View>

      {/* Prompts Section */}
      {data.prompts?.map((prompt, idx) => (
        <View key={idx} style={[styles.promptBlock, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" style={{ color: theme.primary }}>{prompt.question.toUpperCase()}</Text>
          <Text style={[styles.answerText, { color: theme.onSurface }]}>{prompt.answer}</Text>
        </View>
      ))}

      {/* Bio Box */}
      {data.bio && (
        <View style={[styles.promptBlock, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" color="onSurfaceVariant">MY VIBE IS...</Text>
          <Text style={[styles.answerText, { color: theme.onSurface }]}>{data.bio}</Text>
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={[styles.promptBlock, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" color="onSurfaceVariant">SKILLS I BRING</Text>
          <View style={styles.skillsRow}>
            {data.skills.map((s, i) => (
              <SkillTag key={i} name={s.skill.name} proficiency={s.proficiency} />
            ))}
          </View>
        </View>
      )}

      {/* Stats Block */}
      <View style={[styles.statsBlock, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder }]}>
        <Text variant="label-sm" color="neonEmerald">LEVEL {data.level ?? 1}</Text>
        <Text style={[styles.xpText, { color: theme.onSurface }]}>{(data.campusXp ?? 0).toLocaleString()} XP</Text>
      </View>
      
      {/* Bottom spacer for FABs */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_W, height: '100%' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  headerBlock: {
    borderRadius: 24, borderWidth: 1, padding: 32, 
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    marginTop: 8,
  },
  headerInfo: { alignItems: 'center', marginTop: 24 },
  nameText: { fontSize: 32, fontFamily: 'Outfit', fontWeight: 'bold', textAlign: 'center' },
  matchBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 16 },
  promptBlock: {
    borderRadius: 24, borderWidth: 1, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
  },
  answerText: { fontSize: 24, fontFamily: 'Outfit', fontWeight: '500', marginTop: 12, lineHeight: 32 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  statsBlock: {
    borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center',
    marginBottom: 40
  },
  xpText: { fontSize: 28, fontFamily: 'Outfit', fontWeight: '600', marginTop: 8 }
});
