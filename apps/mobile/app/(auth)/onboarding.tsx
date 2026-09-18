import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { usersApi } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState('');
  const [projects, setProjects] = useState('');
  const [socials, setSocials] = useState('');
  const [links, setLinks] = useState('');

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleComplete = async () => {
    setLoading(true);
    
    // Parse comma separated values
    const skillsArray = skills.split(',').map(s => ({ name: s.trim(), proficiency: 'intermediate' })).filter(s => s.name);
    const expArray = experiences.split(',').map(e => ({ title: e.trim() })).filter(e => e.title);
    const projArray = projects.split(',').map(p => ({ name: p.trim() })).filter(p => p.name);
    const linksArray = links.split(',').map(l => l.trim()).filter(l => l);
    
    // Parse social handles (e.g. github:saumya, linkedin:saumya)
    const socialObj: Record<string, string> = {};
    socials.split(',').forEach(s => {
      const parts = s.split(':');
      if (parts.length === 2) socialObj[parts[0].trim()] = parts[1].trim();
    });

    const updateData = {
      bio,
      phoneNumber: phone,
      skills: skillsArray,
      experiences: expArray,
      projects: projArray,
      links: linksArray,
      socialHandles: socialObj,
      onboardingComplete: true
    };

    try {
      const res = await usersApi.updateMe(updateData);
      if (res.success) {
        if (user) {
          setUser({ ...user, ...updateData });
        }
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', res.error || 'Failed to save profile');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2, 3].map(s => (
        <View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? theme.primary : theme.surfaceContainerHighest }]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          {step > 1 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
            </TouchableOpacity>
          ) : <View style={styles.backBtn} />}
          <Text variant="headline-md">Complete Profile</Text>
          <View style={styles.backBtn} />
        </View>

        {renderStepIndicator()}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.formSection}>
              <Text variant="headline-sm" style={{ marginBottom: 16 }}>Basic Info</Text>
              
              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4 }}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="+91 9999999999"
                placeholderTextColor={theme.onSurfaceVariant}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Bio</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={theme.onSurfaceVariant}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.formSection}>
              <Text variant="headline-sm" style={{ marginBottom: 16 }}>Socials & Links</Text>
              
              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4 }}>Social Handles (platform:handle, comma separated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="github:saumya, twitter:saumya"
                placeholderTextColor={theme.onSurfaceVariant}
                value={socials}
                onChangeText={setSocials}
                autoCapitalize="none"
              />

              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Websites / Portfolios (comma separated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="https://example.com, https://dribbble.com/..."
                placeholderTextColor={theme.onSurfaceVariant}
                value={links}
                onChangeText={setLinks}
                autoCapitalize="none"
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.formSection}>
              <Text variant="headline-sm" style={{ marginBottom: 16 }}>Professional</Text>
              
              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4 }}>Skills (comma separated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="React, Python, Figma"
                placeholderTextColor={theme.onSurfaceVariant}
                value={skills}
                onChangeText={setSkills}
              />

              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Experiences (comma separated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="Frontend Intern at XYZ, Freelancer"
                placeholderTextColor={theme.onSurfaceVariant}
                value={experiences}
                onChangeText={setExperiences}
              />

              <Text variant="label-md" style={{ marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Projects (comma separated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.outline }]}
                placeholder="Paladeium, AI Chatbot"
                placeholderTextColor={theme.onSurfaceVariant}
                value={projects}
                onChangeText={setProjects}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 32 }]}
            onPress={step === 3 ? handleComplete : handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text variant="label-lg" style={{ color: theme.onPrimary }}>{step === 3 ? 'Complete Setup' : 'Continue'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  stepContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  stepDot: { width: 32, height: 6, borderRadius: 3 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  formSection: { marginTop: 16 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontFamily: 'Inter_400Regular' },
  textArea: { height: 120, borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, borderWidth: 1, fontSize: 16, fontFamily: 'Inter_400Regular', textAlignVertical: 'top' },
  primaryBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 2 },
});
