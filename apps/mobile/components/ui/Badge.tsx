import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from './Text';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'xp' | 'squad' | 'alert' | 'notification';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'xp',
  style,
  ...props
}) => {
  const theme = useThemeStore((state) => state.getColors(undefined));

  let backgroundColor = theme.surfaceContainerHigh;
  let borderColor = 'transparent';
  let textColor: 'neonEmerald' | 'onSurface' | 'error' | 'onPrimary' = 'onSurface';

  if (variant === 'xp') {
    backgroundColor = 'rgba(16, 185, 129, 0.12)';
    borderColor = 'rgba(67, 233, 123, 0.30)';
    textColor = 'neonEmerald';
  } else if (variant === 'squad') {
    backgroundColor = 'rgba(255, 255, 255, 0.05)';
    borderColor = 'rgba(255, 255, 255, 0.10)';
    textColor = 'onSurface';
  } else if (variant === 'notification') {
    backgroundColor = theme.secondary;
    textColor = 'onPrimary'; // mapped to white usually
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor, borderColor, borderWidth: borderColor !== 'transparent' ? 1 : 0 },
        variant === 'notification' && styles.notification,
        style,
      ]}
      {...props}
    >
      <Text variant="label-sm" color={textColor} style={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  notification: {
    height: 16,
    paddingHorizontal: 4,
    minWidth: 16,
    borderRadius: 8,
  },
});
