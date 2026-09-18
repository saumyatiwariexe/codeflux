import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { authApi, setAuthToken } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useAuthStore(s => s.setUser);

  const handleLogin = async () => {
    if (!regNo || !password) {
      Alert.alert('Error', 'Please enter your Registration Number and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ regNo, password });
      if (res.success && res.data) {
        setAuthToken(res.data.token);
        setUser({
          id: res.data.userId,
          name: res.data.name,
          email: `${res.data.userId}@lpu.in`,
          token: res.data.token,
          onboardingComplete: !res.data.isNewUser
        });

        if (res.data.isNewUser) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Login Failed', res.error || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primaryContainer }]}>
            <Ionicons name="school" size={40} color={theme.primary} />
          </View>
          <Text variant="display-hero" style={{ marginTop: 24, textAlign: 'center' }}>Paladeium</Text>
          <Text variant="body-lg" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center' }}>
            Your Campus. Your Quests. Your People.
          </Text>
        </View>

        <View style={styles.form}>
          <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4 }}>Registration Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
            placeholder="e.g. 12200000"
            placeholderTextColor={theme.onSurfaceVariant}
            value={regNo}
            onChangeText={setRegNo}
            keyboardType="number-pad"
            autoCapitalize="none"
          />

          <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4, marginTop: 16 }}>UMS Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
            placeholder="Password"
            placeholderTextColor={theme.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.primary, marginTop: 32 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text variant="label-lg" style={{ color: theme.onPrimary }}>Sign In with LPU Touch</Text>
            )}
          </TouchableOpacity>
          
          <Text variant="body-sm" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: 16, opacity: 0.7 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy. Paladeium is not officially affiliated with LPU.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  iconContainer: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  form: { width: '100%' },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontFamily: 'Inter_400Regular' },
  loginBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 2 },
});
