import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< Updated upstream
import { router } from 'expo-router';
import { useOAuth, useSSO } from '@clerk/expo';
=======
import { useOAuth, useAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
>>>>>>> Stashed changes
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

<<<<<<< Updated upstream
const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'map' as const, label: 'Explore LPU like never before' },
  { icon: 'people' as const, label: 'Find your perfect hackathon team' },
  { icon: 'trophy' as const, label: 'Earn XP for being on campus' },
  { icon: 'ribbon' as const, label: 'Track your EduRev achievements' },
=======
// Required by Clerk on Android to close the browser tab after OAuth redirect
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

// Feature highlights shown in the animated section
const FEATURES = [
  { icon: 'map-outline' as const, label: 'Explore LPU like never before' },
  { icon: 'people-outline' as const, label: 'Find your perfect hackathon team' },
  { icon: 'star-outline' as const, label: 'Earn XP for being on campus' },
  { icon: 'school-outline' as const, label: 'Track your EduRev achievements' },
>>>>>>> Stashed changes
];

export default function WelcomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const { isSignedIn } = useAuth();

<<<<<<< Updated upstream
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = React.useState(false);

  // ---- Animation values ----
=======
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');

  // OAuth hooks — Clerk handles the redirect & token exchange
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGitHub } = useOAuth({ strategy: 'oauth_github' });

  // ── Animation values ──────────────────────────────────────────────────────
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  /**
   * Initiates the Google OAuth flow via Clerk.
   * On success, Clerk's useAuth hook in _layout.tsx detects the session
   * and routes to (tabs).
   */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        // _layout.tsx useUser effect will handle navigation
      }
    } catch (err) {
      console.error('OAuth error:', err);
    } finally {
      setLoading(false);
    }
  };

=======
  // ── OAuth handlers ────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingProvider('google');
    try {
      const { createdSessionId, setActive } = await startGoogle();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // Root layout's useEffect will detect isSignedIn change and redirect
      }
    } catch (err) {
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
      setError('GitHub sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <Ionicons name="globe" size={52} color={theme.primary} />
=======
          <Ionicons name="planet-outline" size={52} color={theme.primary} />
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              { backgroundColor: theme.surfaceContainerLow + 'cc', borderColor: 'rgba(255,255,255,0.07)' },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name={f.icon} size={18} color={theme.primary} />
            </View>
=======
              {
                backgroundColor: theme.surfaceContainerLow + 'cc',
                borderColor: theme.glassBorder,
              },
            ]}
          >
            <Ionicons name={f.icon} size={20} color={theme.primary} />
>>>>>>> Stashed changes
            <Text variant="body-md" style={{ flex: 1 }}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA Buttons */}
<<<<<<< Updated upstream
      <Animated.View style={[styles.ctaSection, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}>
        {/* Google Sign In */}
        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: '#fff' }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text variant="label-lg" style={{ color: '#111', marginLeft: 10 }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email sign-in */}
        <TouchableOpacity
          style={[styles.emailBtn, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant }]}
          onPress={() => router.push('/(auth)/sign-in')}
          activeOpacity={0.85}
        >
          <Ionicons name="mail-outline" size={20} color={theme.onSurface} />
          <Text variant="label-lg" style={{ color: theme.onSurface, marginLeft: 10 }}>
            Continue with Email
=======
      <Animated.View
        style={[styles.ctaSection, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}
      >
        {!!error && (
          <Text
            variant="label-sm"
            style={{ color: theme.error, textAlign: 'center', marginBottom: 12 }}
          >
            {error}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
        <Text variant="label-sm" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: 16 }}>
          By continuing, you agree to our Terms and Privacy Policy.
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  glowRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
  logoCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  featuresSection: { paddingHorizontal: 24, gap: 10, marginBottom: 24 },
=======
  glowRing: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2,
  },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  featuresSection: { paddingHorizontal: 24, gap: 12, marginBottom: 24 },
>>>>>>> Stashed changes
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1,
  },
<<<<<<< Updated upstream
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ctaSection: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  googleBtn: {
    height: 56, borderRadius: 28, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  emailBtn: {
    height: 56, borderRadius: 28, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
=======
  ctaSection: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  oauthBtn: {
    height: 56, borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    gap: 0,
>>>>>>> Stashed changes
  },
  oauthBtnSecondary: {},
});
