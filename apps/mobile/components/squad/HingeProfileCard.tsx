import React from 'react';
import { View, StyleSheet, Dimensions, useColorScheme, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Avatar } from '../ui/Avatar';
import { SkillTag } from '../profile/SkillTag';
import { useThemeStore } from '../../stores/useThemeStore';
import { SwipeCardData } from './HingeFeed'; // We'll move the interface here or to a types file

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface HingeProfileCardProps {
  data: SwipeCardData;
  onLikeInteraction: (itemType: string, content: string) => void;
  onPass: () => void;
}

export function HingeProfileCard({ data, onLikeInteraction, onPass }: HingeProfileCardProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));



  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      {/* Hero Block */}
      <View style={[styles.block, styles.heroBlock, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.nameText, { color: theme.onSurface }]}>{data.displayName}</Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            @{data.handle} · {data.department} · Year {data.year}
          </Text>
          <View style={[styles.matchBadge, { backgroundColor: theme.primaryContainer }]}>
            <Text variant="label-sm" style={{ color: theme.primary }}>{data.matchScore}% Synergy</Text>
          </View>
        </View>
        <Avatar displayName={data.displayName} avatarUrl={data.avatarUrl} size={SCREEN_W - 34} variant="square" />
      </View>

      {/* Bio / Goal Block */}
      {data.bio && (
        <View style={[styles.block, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" color="onSurfaceVariant">MY VIBE IS...</Text>
          <Text style={[styles.answerText, { color: theme.onSurface }]}>{data.bio}</Text>
        </View>
      )}

      {/* Prompts Section */}
      {data.prompts?.map((prompt, idx) => (
        <View key={idx} style={[styles.block, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" style={{ color: theme.primary }}>{prompt.question.toUpperCase()}</Text>
          <Text style={[styles.answerText, { color: theme.onSurface }]}>{prompt.answer}</Text>
        </View>
      ))}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={[styles.block, { backgroundColor: theme.surfaceContainer, borderColor: theme.glassBorder }]}>
          <Text variant="label-sm" color="onSurfaceVariant">SKILLS I BRING</Text>
          <View style={styles.skillsRow}>
            {data.skills.map((s, i) => (
              <SkillTag key={i} name={s.skill.name} icon={s.skill.icon} proficiency={s.proficiency} />
            ))}
          </View>
        </View>
      )}

      {/* Stats Block */}
      <View style={[styles.block, styles.statsBlock, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder }]}>
        <Text variant="label-sm" color="neonEmerald">LEVEL {data.level ?? 1}</Text>
        <Text style={[styles.xpText, { color: theme.onSurface }]}>{(data.campusXp ?? 0).toLocaleString()} XP</Text>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  block: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: 'relative',
  },
  heroBlock: {
    alignItems: 'center',
    padding: 0,
    marginTop: 8,
    overflow: 'hidden',
  },
  headerInfo: { 
    width: '100%',
    alignItems: 'flex-start', 
    paddingTop: 32, 
    paddingBottom: 24, 
    paddingHorizontal: 24 
  },
  nameText: { fontSize: 32, fontFamily: 'Outfit', fontWeight: 'bold', textAlign: 'left' },
  matchBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 16 },
  answerText: { fontSize: 24, fontFamily: 'Outfit', fontWeight: '500', marginTop: 12, lineHeight: 32 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  statsBlock: {
    alignItems: 'center',
  },
  xpText: { fontSize: 28, fontFamily: 'Outfit', fontWeight: '600', marginTop: 8 }
});
