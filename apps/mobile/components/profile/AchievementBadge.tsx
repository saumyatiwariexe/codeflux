import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Text } from '../ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  name: string;
  emoji?: string;
  rarity: BadgeRarity;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_COLORS: Record<BadgeRarity, { glow: string; border: string; label: string }> = {
  common:    { glow: '#9CA3AF33', border: '#9CA3AF',  label: '#9CA3AF' },
  rare:      { glow: '#60A5FA33', border: '#3B82F6',  label: '#60A5FA' },
  epic:      { glow: '#A78BFA33', border: '#8B5CF6',  label: '#A78BFA' },
  legendary: { glow: '#FCD34D55', border: '#F59E0B',  label: '#FCD34D' },
};

const RARITY_EMOJIS: Record<BadgeRarity, string> = {
  common: '',
  rare: '',
  epic: '',
  legendary: '',
};

/**
 * Achievement badge with rarity-based glow ring and color coding.
 * common=grey, rare=blue, epic=purple, legendary=gold+glow.
 */
export function AchievementBadge({ name, emoji, rarity, size = 'md' }: AchievementBadgeProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const colors = RARITY_COLORS[rarity];
  const displayEmoji = emoji ?? RARITY_EMOJIS[rarity];

  const containerSize = size === 'sm' ? 56 : size === 'lg' ? 88 : 72;
  const emojiSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;

  return (
    <View style={[styles.wrapper, { alignItems: 'center', gap: 6 }]}>
      {/* Glow + border ring */}
      <View
        style={[
          styles.circle,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: colors.glow,
            borderColor: colors.border,
            borderWidth: rarity === 'legendary' ? 2 : 1.5,
            shadowColor: colors.border,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: rarity === 'legendary' ? 0.9 : 0.4,
            shadowRadius: rarity === 'legendary' ? 12 : 6,
            elevation: rarity === 'legendary' ? 10 : 4,
          },
        ]}
      >
        <Text style={{ fontSize: emojiSize }}>{displayEmoji}</Text>
      </View>
      {size !== 'sm' && (
        <Text
          variant="label-xs"
          numberOfLines={2}
          style={{ color: colors.label, textAlign: 'center', maxWidth: containerSize + 16 }}
        >
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  circle: { alignItems: 'center', justifyContent: 'center' },
});
