import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';

interface CardProps extends ViewProps {
  variant?: 'default' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  style, 
  children, 
  ...props 
}) => {
  const theme = useThemeStore((state) => state.getColors(undefined));

  let variantStyle: StyleProp<ViewStyle> = {};

  if (variant === 'default') {
    variantStyle = {
      backgroundColor: theme.surfaceContainerLow,
      borderRadius: 24, // rounded-2xl
      overflow: 'hidden',
    };
  } else if (variant === 'glass') {
    variantStyle = {
      backgroundColor: theme.surfaceContainerLow, // Fallback if blur isn't fully supported without expo-blur
      borderColor: theme.glassBorder,
      borderWidth: 1,
      borderRadius: 24,
      overflow: 'hidden',
      // To get real glass effect in RN, we'd wrap this with expo-blur, but for now we simulate
    };
  } else if (variant === 'elevated') {
    variantStyle = {
      backgroundColor: theme.surfaceSpaceElevated,
      borderColor: theme.glassBorder,
      borderWidth: 1,
      borderRadius: 32, // rounded-3xl
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 36,
      elevation: 10,
    };
  }

  return (
    <View style={[variantStyle, style]} {...props}>
      {children}
    </View>
  );
};
