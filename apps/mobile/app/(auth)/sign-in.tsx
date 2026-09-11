import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  useColorScheme, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignIn, useSignUp } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

type AuthMode = 'sign-in' | 'sign-up';

/** Combined sign-in / sign-up screen using Clerk email+password. */
export default function SignInScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const inputStyle = [styles.input, {
    backgroundColor: theme.surfaceContainerLow,
    borderColor: theme.outlineVariant,
    color: theme.onSurface,
  }];

  /** Sign in with existing email+password. */
  const handleSignIn = async () => {
    if (!signInLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        // _layout.tsx handles nav to (tabs)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /** Register a new account — sends email verification code. */
  const handleSignUp = async () => {
    if (!signUpLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Sign up failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  /** Verify email with 6-digit code sent by Clerk. */
  const handleVerify = async () => {
    if (!signUpLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.onSurface} />
          </TouchableOpacity>
          <Text variant="headline-lg" style={{ marginTop: 32 }}>Check your email</Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            We sent a 6-digit code to {email}. Enter it below to verify your account.
          </Text>
          <TextInput
            style={[inputStyle, { marginTop: 32, letterSpacing: 8, textAlign: 'center', fontSize: 24 }]}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="------"
            placeholderTextColor={theme.onSurfaceVariant}
          />
          {error ? (
            <Text variant="label-sm" style={{ color: theme.error, marginTop: 8 }}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 24 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={theme.onPrimary} />
              : <Text variant="label-lg" style={{ color: theme.onPrimary }}>Verify Email</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.onSurface} />
          </TouchableOpacity>

          <Text variant="headline-lg" style={{ marginTop: 32 }}>
            {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
          </Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8, marginBottom: 32 }}>
            {mode === 'sign-in'
              ? 'Sign in to your Paladeium account.'
              : 'Join Paladeium — your LPU campus companion.'}
          </Text>

          {/* Email */}
          <Text variant="label-sm" color="onSurfaceVariant" style={{ marginBottom: 6 }}>EMAIL</Text>
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor={theme.onSurfaceVariant}
          />

          {/* Password */}
          <Text variant="label-sm" color="onSurfaceVariant" style={{ marginBottom: 6, marginTop: 16 }}>PASSWORD</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              placeholder="Min. 8 characters"
              placeholderTextColor={theme.onSurfaceVariant}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass(!showPass)}
            >
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.errorContainer }]}>
              <Ionicons name="warning" size={14} color={theme.error} />
              <Text variant="label-sm" style={{ color: theme.error, marginLeft: 6 }}>{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 28 }]}
            onPress={mode === 'sign-in' ? handleSignIn : handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={theme.onPrimary} />
              : <Text variant="label-lg" style={{ color: theme.onPrimary }}>
                  {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
                </Text>
            }
          </TouchableOpacity>

          {/* Mode toggle */}
          <TouchableOpacity
            style={{ marginTop: 20, alignItems: 'center' }}
            onPress={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }}
          >
            <Text variant="body-sm" color="onSurfaceVariant">
              {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
              <Text variant="body-sm" color="primary">
                {mode === 'sign-in' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn: { padding: 4, alignSelf: 'flex-start' },
  input: {
    height: 52, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, fontSize: 16,
  },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 10, marginTop: 12,
  },
  primaryBtn: {
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});
