import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

type Proficiency = 'beginner' | 'intermediate' | 'expert';

interface SkillTagProps {
  name: string;
  icon?: string;
  proficiency?: Proficiency;
  showProficiency?: boolean;
}

const PROFICIENCY_COLORS: Record<Proficiency, string> = {
  beginner: '#9CA3AF',
  intermediate: '#60A5FA',
  expert: '#43E97B',
};

const PROFICIENCY_DOTS: Record<Proficiency, number> = {
  beginner: 1,
  intermediate: 2,
  expert: 3,
};

/**
 * Skill tag pill with optional proficiency dots (green=expert, blue=intermediate, grey=beginner).
 */
export function SkillTag({ name, icon, proficiency = 'intermediate', showProficiency = true }: SkillTagProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const dotColor = PROFICIENCY_COLORS[proficiency];
  const dots = PROFICIENCY_DOTS[proficiency];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: theme.surfaceContainerLow,
          borderColor: dotColor + '55',
        },
      ]}
    >
      {icon && <MaterialCommunityIcons name={icon as any} size={16} color={theme.onSurface} />}
      <Text variant="label-sm" style={{ color: theme.onSurface }}>{name}</Text>
      {showProficiency && (
        <View style={styles.dots}>
          {[1, 2, 3].map((d) => (
            <View
              key={d}
              style={[styles.dot, { backgroundColor: d <= dots ? dotColor : theme.surfaceContainerHigh }]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1,
  },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
