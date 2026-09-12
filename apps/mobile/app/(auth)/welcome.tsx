import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { PaladeiumLogo } from '../../components/ui/PaladeiumLogo';

const { width, height } = Dimensions.get('window');

// Feature highlights shown in the animated tagline section
const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'map-outline',         label: 'Explore LPU like never before' },
  { icon: 'people-outline',      label: 'Find your perfect hackathon team' },
  { icon: 'trophy-outline',      label: 'Earn XP for being on campus' },
  { icon: 'ribbon-outline',      label: 'Track your EduRev achievements' },
];

export default function WelcomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  // ---- Animation values ----
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(40)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ctaY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      {/* Background gradient blobs */}
      <View style={[styles.blobTop, { backgroundColor: theme.primary + '22' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.neonEmerald + '18' }]} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        {/* Logo — Paladeium tern SVG, no circle */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
        >
          <PaladeiumLogo size={160} tint={theme.primary} />
        </Animated.View>

        <Animated.View style={{ opacity: logoOpacity, marginTop: 24, alignItems: 'center' }}>
          <Text variant="display-hero" style={{ textAlign: 'center', letterSpacing: -1 }}>
            Paladeium
          </Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center' }}>
            Your Campus. Your Quests. Your People.
          </Text>
        </Animated.View>
      </View>

      {/* Feature highlights */}
      <Animated.View
        style={[styles.featuresSection, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}
      >
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.featureRow, { backgroundColor: theme.surfaceContainerLow + 'cc' }]}>
            <Ionicons name={f.icon} size={22} color={theme.primary} />
            <Text variant="body-md" style={{ flex: 1 }}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View
        style={[styles.ctaSection, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}
      >
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text variant="label-lg" style={{ color: theme.onPrimary, textAlign: 'center' }}>
            Login / Sign Up
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: {
    position: 'absolute', top: -80, right: -80,
    width: 240, height: 240, borderRadius: 120,
  },
  blobBottom: {
    position: 'absolute', bottom: 100, left: -60,
    width: 180, height: 180, borderRadius: 90,
  },
  logoSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },

  featuresSection: { paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  ctaSection: { paddingHorizontal: 24, paddingBottom: 32 },
  primaryBtn: {
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});
