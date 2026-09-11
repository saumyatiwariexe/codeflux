import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth, useAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

// Required by Clerk on Android to close the browser tab after OAuth redirect
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

// Feature highlights shown in the animated section
const FEATURES = [
  { icon: 'map-outline' as const, label: 'Explore LPU like never before' },
  { icon: 'people-outline' as const, label: 'Find your perfect hackathon team' },
  { icon: 'star-outline' as const, label: 'Earn XP for being on campus' },
  { icon: 'school-outline' as const, label: 'Track your EduRev achievements' },
];

export default function WelcomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const { isSignedIn } = useAuth();

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');

  // OAuth hooks — Clerk handles the redirect & token exchange
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGitHub } = useOAuth({ strategy: 'oauth_github' });

  // Animation values
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(40)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

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

  // OAuth handlers
  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingProvider('google');
    try {
      const { createdSessionId, setActive } = await startGoogle();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setLoadingProvider('github');
    try {
      const { createdSessionId, setActive } = await startGitHub();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('GitHub sign-in error:', err);
      setError('GitHub sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      {/* Background gradient blobs */}
      <View style={[styles.blobTop, { backgroundColor: theme.primary + '22' }]} />
      <View style={[styles.blobBottom, { backgroundColor: theme.neonEmerald + '18' }]} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        <Animated.View
          style={[styles.glowRing, { borderColor: theme.primary + '44', transform: [{ scale: glowScale }] }]}
        />
        <Animated.View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.primaryContainer, transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <Ionicons name="planet-outline" size={52} color={theme.primary} />
        </Animated.View>

        <Animated.View style={{ opacity: logoOpacity, marginTop: 24, alignItems: 'center' }}>
          <Text variant="display-hero" style={{ textAlign: 'center', letterSpacing: -1 }}>
            Pala
            <Text variant="display-hero" color="primary">deium</Text>
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
          <View
            key={i}
            style={[
              styles.featureRow,
              {
                backgroundColor: theme.surfaceContainerLow + 'cc',
                borderColor: theme.glassBorder,
              },
            ]}
          >
            <Ionicons name={f.icon} size={20} color={theme.primary} />
            <Text variant="body-md" style={{ flex: 1 }}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View
        style={[styles.ctaSection, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}
      >
        {!!error && (
          <Text
            variant="label-sm"
            style={{ color: theme.error, textAlign: 'center', marginBottom: 12 }}
          >
            {error}
          </Text>
        )}

        {/* Google OAuth button */}
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder }]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityLabel="Sign in with Google"
        >
          {loadingProvider === 'google' ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={22} color="#4285F4" />
              <Text variant="label-lg" style={{ flex: 1, textAlign: 'center', marginRight: 22 }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* GitHub OAuth button */}
        <TouchableOpacity
          style={[
            styles.oauthBtn,
            styles.oauthBtnSecondary,
            { backgroundColor: theme.surfaceContainerLow, borderColor: theme.glassBorder },
          ]}
          onPress={handleGitHubSignIn}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityLabel="Sign in with GitHub"
        >
          {loadingProvider === 'github' ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <Ionicons name="logo-github" size={22} color={theme.onSurface} />
              <Text variant="label-lg" style={{ flex: 1, textAlign: 'center', marginRight: 22 }}>
                Continue with GitHub
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text
          variant="label-sm"
          color="onSurfaceVariant"
          style={{ textAlign: 'center', marginTop: 16, lineHeight: 18 }}
        >
          By continuing, you agree to Paladeium's terms.{'\n'}
          For LPU students — use your university Google account.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: { position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: 120 },
  blobBottom: { position: 'absolute', bottom: 100, left: -60, width: 180, height: 180, borderRadius: 90 },
  logoSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresSection: { paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  ctaSection: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  oauthBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  oauthBtnSecondary: {},
});
