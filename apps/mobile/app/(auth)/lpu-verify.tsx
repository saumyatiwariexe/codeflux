import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  Animated, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi, setAuthToken } from '../../services/api';

type Step = 'email' | 'otp';

export default function LpuVerifyScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const signIn = useAuthStore((s) => s.signIn);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // Shown in dev mode

  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    // Bypassing auth for now to allow any email into the app
    const userEmail = email || 'guest@lpu.in';
    const fakeToken = 'mock-dev-token-123';
    
    setAuthToken(fakeToken);
    await signIn({
      userId: 'mock-dev-user-id',
      email: userEmail,
      token: fakeToken,
      isNewUser: false,
    });
    
    router.replace('/(tabs)');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      shake();
      return;
    }
    setIsLoading(true);
    setError('');

    const res = await authApi.verifyOtp(email, otp);
    setIsLoading(false);

    if (res.success && res.data) {
      setAuthToken(res.data.token);
      await signIn({
        userId: res.data.userId,
        email,
        token: res.data.token,
        isNewUser: res.data.isNewUser,
      });

      if (res.data.isNewUser) {
        router.replace('/(auth)/onboarding-profile');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      setError(res.error ?? 'Invalid OTP');
      shake();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => (step === 'otp' ? setStep('email') : router.back())} style={styles.backBtn}>
          <Text variant="label-md" color="primary">← {step === 'otp' ? 'Change email' : 'Back'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text variant="display-hero">
            {step === 'email' ? '' : ''}
          </Text>
          <Text variant="headline-lg" style={{ marginTop: 16 }}>
            {step === 'email' ? 'Verify your LPU email' : 'Enter the code'}
          </Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            {step === 'email'
              ? "We'll send a 6-digit OTP to your LPU email address"
              : `Code sent to ${email}. Valid for 10 minutes.`}
          </Text>
        </View>

        {/* Input field */}
        <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceContainerLow,
                color: theme.onSurface,
                borderColor: error ? theme.error : theme.glassBorder,
              },
            ]}
            placeholder={step === 'email' ? 'your.name@lpu.in' : '6-digit code'}
            placeholderTextColor={theme.onSurfaceVariant}
            value={step === 'email' ? email : otp}
            onChangeText={(v) => {
              setError('');
              if (step === 'email') setEmail(v.toLowerCase());
              else setOtp(v.replace(/\D/g, '').slice(0, 6));
            }}
            keyboardType={step === 'email' ? 'email-address' : 'number-pad'}
            autoCapitalize="none"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={step === 'email' ? handleSendOtp : handleVerifyOtp}
          />
          {!!error && (
            <Text variant="label-sm" style={{ color: theme.error, marginTop: 6 }}>
              {error}
            </Text>
          )}
          {/* Dev OTP hint */}
          {step === 'otp' && !!devOtp && (
            <Text variant="label-sm" style={{ color: theme.accentGold, marginTop: 6 }}>
               Dev mode OTP: {devOtp}
            </Text>
          )}
        </Animated.View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
          onPress={step === 'email' ? handleSendOtp : handleVerifyOtp}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text variant="label-lg" style={{ color: theme.onPrimary }}>
              {step === 'email' ? 'Send Code' : 'Verify & Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 20 },
  backBtn: { position: 'absolute', top: 20, left: 24 },
  header: { marginBottom: 8 },
  input: {
    height: 56, borderRadius: 16, paddingHorizontal: 20,
    fontSize: 16, fontFamily: 'Inter', borderWidth: 1,
  },
  btn: {
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
});
