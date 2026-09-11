import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';

interface TextProps extends RNTextProps {
  variant?: 'display-hero' | 'headline-lg' | 'headline-md' | 'headline-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'label-lg' | 'label-md' | 'label-sm' | 'label-xs' | 'code-sm';
  color?: 'onSurface' | 'onSurfaceVariant' | 'primary' | 'secondary' | 'error' | 'neonEmerald' | 'accentGold' | 'onPrimary';
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'body-md', 
  color = 'onSurface', 
  style, 
  ...props 
}) => {
  const theme = useThemeStore((state) => state.getColors(undefined)); // We'll pass system scheme later if needed

  const textStyle: TextStyle = {
    color: theme[color],
    ...typography[variant],
  };

  return (
    <RNText style={[textStyle, style]} {...props} />
  );
};

// Simplified mapping of typography from DESIGN.md
const typography: Record<string, TextStyle> = {
  'display-hero': {
    fontFamily: 'Outfit_700Bold',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.02 * 34,
  },
  'headline-lg': {
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.015 * 26,
  },
  'headline-md': {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.01 * 20,
  },
  'headline-sm': {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  'body-lg': {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  'body-md': {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  'body-sm': {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  'label-lg': {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  'label-md': {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.01 * 13,
  },
  'label-sm': {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.04 * 11,
  },
  'label-xs': {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    letterSpacing: 0.04 * 10,
  },
  'code-sm': {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};
