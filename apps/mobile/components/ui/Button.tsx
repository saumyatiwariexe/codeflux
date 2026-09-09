import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  style,
  children,
  ...props
}) => {
  const theme = useThemeStore((state) => state.getColors(undefined));

  let backgroundColor = theme.primary;
  let textColor: 'onPrimary' | 'onSurface' | 'primary' = 'onPrimary';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    backgroundColor = 'rgba(255, 255, 255, 0.06)'; // Glass CTA
    borderColor = theme.glassBorder;
    borderWidth = 1;
    textColor = 'onSurface';
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = 'onSurface';
  }

  const isIconOnly = variant === 'icon' || (!title && icon);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.base,
        isIconOnly ? styles.iconBase : styles.textBase,
        { backgroundColor, borderWidth, borderColor },
        style,
      ]}
      {...props}
    >
      {/* We are simplifying the gradient for the primary button to just the primary color for now, 
          can use expo-linear-gradient later for the exact 135deg violet-coral mix */}
      {icon && <View style={title ? { marginRight: 8 } : {}}>{icon}</View>}
      {title && (
        <Text variant="headline-sm" color={textColor}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999, // rounded-full
  },
  textBase: {
    height: 52,
    paddingHorizontal: 24,
  },
  iconBase: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
