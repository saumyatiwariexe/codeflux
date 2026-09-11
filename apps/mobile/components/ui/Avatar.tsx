import React from 'react';
import { View, StyleSheet, useColorScheme, Image } from 'react-native';
import { Text } from '../ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

interface AvatarProps {
  displayName: string;
  avatarUrl?: any;
  size?: number;
  isOnline?: boolean;
  showOnlineDot?: boolean;
}

/** Gets initials from a display name */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Gets a deterministic color from a name string */
function getAvatarColor(name: string): string {
  const COLORS = ['#6C63FF', '#FF6584', '#43E97B', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Avatar component with initials fallback, online dot, and consistent color generation.
 */
export function Avatar({ displayName, avatarUrl, size = 48, isOnline, showOnlineDot = false }: AvatarProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const bg = getAvatarColor(displayName);
  const initials = getInitials(displayName);
  const fontSize = size * 0.35;
  const dotSize = size * 0.28;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderWidth: 2,
            borderColor: theme.surfaceSpaceDeep,
            overflow: 'hidden'
          },
        ]}
      >
        {avatarUrl ? (
          <Image source={typeof avatarUrl === 'string' ? { uri: avatarUrl } : avatarUrl} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        ) : (
          <Text style={[styles.initials, { fontSize, color: '#FFFFFF', fontFamily: 'Outfit' }]}>
            {initials}
          </Text>
        )}
      </View>
      {showOnlineDot && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? theme.neonEmerald : theme.surfaceContainerHigh,
              borderColor: theme.surfaceSpaceDeep,
              bottom: 1,
              right: 1,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    borderWidth: 2,
  },
});
