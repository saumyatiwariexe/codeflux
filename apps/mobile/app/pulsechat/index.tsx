import React from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

const MOCK_CHATS = [
  { id: '1', name: 'Aarav Sharma', msg: 'Hey! Saw we matched on SquadUp. You doing HackLPU?', time: '2m', unread: 1, type: 'squad' },
  { id: '2', name: 'GDSC Core Team', msg: 'Reminder: Friday session moved to Block 32.', time: '1h', unread: 0, type: 'group' },
  { id: '3', name: 'Neha S.', msg: 'Are you taking the Cloud Computing elective?', time: 'Yesterday', unread: 0, type: 'direct' },
];

export default function PulseChatScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.glassBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text variant="label-lg" color="primary">← Back</Text>
        </TouchableOpacity>
        <Text variant="headline-md">PulseChat</Text>
        <TouchableOpacity>
          <Text variant="label-lg" color="primary">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Text variant="label-sm" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
             All DMs are end-to-end encrypted
          </Text>
        </View>

        {MOCK_CHATS.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={[styles.chatRow, { borderBottomColor: theme.glassBorder }]}
            onPress={() => router.push(`/pulsechat/${chat.id}` as any)}
          >
            <Avatar displayName={chat.name} size={50} showOnlineDot={chat.unread > 0} isOnline={chat.unread > 0} />
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text variant="headline-sm">{chat.name}</Text>
                <Text variant="label-xs" color="onSurfaceVariant">{chat.time}</Text>
              </View>
              <View style={styles.msgRow}>
                <Text 
                  variant="body-sm" 
                  color={chat.unread > 0 ? 'onSurface' : 'onSurfaceVariant'} 
                  numberOfLines={1}
                  style={{ flex: 1, fontWeight: chat.unread > 0 ? '600' : '400' }}
                >
                  {chat.msg}
                </Text>
                {chat.unread > 0 && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]}>
                    <Text variant="label-xs" style={{ color: theme.onPrimary }}>{chat.unread}</Text>
                  </View>
                )}
              </View>
              {chat.type === 'squad' && (
                <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                  <Badge label=" Squad Match" variant="squad" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 8, paddingRight: 16 },
  content: { paddingBottom: 40 },
  banner: { paddingVertical: 12, paddingHorizontal: 20 },
  chatRow: { 
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  chatInfo: { flex: 1, gap: 2 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  unreadDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
