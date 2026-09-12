import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { setAuthToken } from '../../services/api';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function LoginScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (isNewUser: boolean) => {
    if (!email || !password) return;
    
    setIsLoading(true);
    
    // Bypassing real auth — just using local mock data
    const fakeToken = 'mock-dev-token-123';
    let mockUserId = email.split('@')[0] || 'mock-dev-user-id';
    
    // Generate a real UUID for new users so we can insert them into Supabase
    if (isNewUser) {
      mockUserId = generateUUID();
    }
    
    setAuthToken(fakeToken);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    await signIn({
      userId: mockUserId,
      email: email.toLowerCase(),
      token: fakeToken,
      isNewUser: isNewUser,
    });
    
    setIsLoading(false);

    if (isNewUser) {
      router.replace('/(auth)/onboarding-profile');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text variant="label-md" color="primary">← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text variant="headline-lg">Welcome to Paladeium</Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            Enter any email and password to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceContainerLow,
                color: theme.onSurface,
                borderColor: theme.glassBorder,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceContainerLow,
                color: theme.onSurface,
                borderColor: theme.glassBorder,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
            onPress={() => handleAuth(false)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text variant="label-lg" style={{ color: theme.onPrimary }}>
                Login
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnOutline, { borderColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
            onPress={() => handleAuth(true)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text variant="label-lg" style={{ color: theme.primary }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 24 },
  backBtn: { position: 'absolute', top: 20, left: 24 },
  header: { marginBottom: 8 },
  form: { gap: 16 },
  input: {
    height: 56, borderRadius: 16, paddingHorizontal: 20,
    fontSize: 16, fontFamily: 'Inter', borderWidth: 1,
  },
  actions: { gap: 12, marginTop: 12 },
  btn: {
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutline: {
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
});
