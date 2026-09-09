import React from 'react';
import { View, StyleSheet, useColorScheme, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/useThemeStore';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';

export default function ProfileScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headline-md">Profile & Settings</Text>
      </View>

      <View style={styles.content}>
        <Card variant="glass" style={styles.card}>
          <Text variant="headline-sm" style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text variant="body-lg">Appearance</Text>
              <Text variant="body-sm" color="onSurfaceVariant">
                Current: {themeMode === 'system' ? `System (${systemColorScheme})` : themeMode}
              </Text>
            </View>
            <View style={styles.toggles}>
              <View style={styles.toggleItem}>
                <Text variant="label-md">Light</Text>
                <Switch
                  value={themeMode === 'light'}
                  onValueChange={(val) => {
                    if (val) setThemeMode('light');
                    else setThemeMode('system');
                  }}
                  trackColor={{ false: theme.surfaceContainerHighest, true: theme.primary }}
                />
              </View>
              <View style={styles.toggleItem}>
                <Text variant="label-md">Dark</Text>
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={(val) => {
                    if (val) setThemeMode('dark');
                    else setThemeMode('system');
                  }}
                  trackColor={{ false: theme.surfaceContainerHighest, true: theme.primary }}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Placeholder for rest of profile sections */}
        <Card variant="default" style={[styles.card, { marginTop: 16 }]}>
          <Text variant="headline-sm">Verification</Text>
          <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 8 }}>
            📧 Email Verified (LPU email)
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggles: {
    flexDirection: 'row',
    gap: 16,
  },
  toggleItem: {
    alignItems: 'center',
    gap: 4,
  },
});
