import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';

interface XPBarProps {
  current: number;
  total: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

/**
 * Animated gradient XP progress bar.
 * Renders a filled bar from 0% to (current/total)%.
 */
export function XPBar({ current, total, color, height = 8, showLabel = false, animated = true }: XPBarProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const fillColor = color ?? theme.primary;

  const progress = Math.min(1, Math.max(0, current / total));
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: progress,
        tension: 50,
        friction: 10,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(progress);
    }
  }, [progress]);

  return (
    <View style={{ gap: 4 }}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Animated.Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {current.toLocaleString()} XP
          </Animated.Text>
          <Animated.Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {total.toLocaleString()} XP
          </Animated.Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.surfaceContainerHigh, height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: fillColor,
              height,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        {/* Shimmer highlight */}
        <View style={[styles.shimmer, { height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 99, overflow: 'hidden', width: '100%' },
  fill: { borderRadius: 99 },
  shimmer: {
    position: 'absolute',
    top: 0, left: '30%', width: '20%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontFamily: 'Inter' },
});
