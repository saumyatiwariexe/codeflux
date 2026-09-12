import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Avatar } from '../../components/ui/Avatar';
import { useThemeStore } from '../../stores/useThemeStore';

// Mock data mapping
const MOCK_CHAT_DETAILS: Record<string, { name: string; type: string; messages: { id: string; text: string; sender: 'me' | 'them'; time: string }[] }> = {
  '1': {
    name: 'Aarav Sharma',
    type: 'squad',
    messages: [
      { id: 'm1', text: 'Hey! Saw we matched on SquadUp.', sender: 'them', time: '10:41 AM' },
      { id: 'm2', text: 'Are you doing HackLPU?', sender: 'them', time: '10:41 AM' },
      { id: 'm3', text: 'Yes! Im looking for a frontend dev for my idea.', sender: 'me', time: '10:43 AM' },
      { id: 'm4', text: 'Awesome, Im solid with React Native. What is the problem statement?', sender: 'them', time: '10:45 AM' },
    ]
  },
  '2': {
    name: 'GDSC Core Team',
    type: 'group',
    messages: [
      { id: 'm1', text: 'Meeting is at 4 PM today.', sender: 'them', time: '2:00 PM' },
      { id: 'm2', text: 'Reminder: Friday session moved to Block 32.', sender: 'them', time: '3:00 PM' },
    ]
  },
  '3': {
    name: 'Neha S.',
    type: 'direct',
    messages: [
      { id: 'm1', text: 'Are you taking the Cloud Computing elective?', sender: 'them', time: 'Yesterday' },
      { id: 'm2', text: 'Yeah, I picked AWS track.', sender: 'me', time: 'Yesterday' },
    ]
  },
};

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  
  const chatData = MOCK_CHAT_DETAILS[id as string] || { name: 'Unknown User', type: 'direct', messages: [] };
  
  const [messages, setMessages] = useState(chatData.messages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me' as const,
      time: 'Just now'
    };
    
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.glassBorder, backgroundColor: theme.surfaceSpaceElevated }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Avatar displayName={chatData.name} size={36} />
          <View style={styles.headerInfo}>
            <Text variant="headline-sm">{chatData.name}</Text>
            {chatData.type === 'squad' && <Text variant="label-xs" color="primary">Squad Match</Text>}
          </View>
          <TouchableOpacity style={styles.infoBtn}>
            <Ionicons name="information-circle-outline" size={24} color={theme.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <ScrollView 
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          ref={(ref) => ref?.scrollToEnd({ animated: false })}
        >
          <View style={styles.encryptionBanner}>
             <Ionicons name="lock-closed" size={12} color={theme.accentGold} style={{ marginRight: 4 }} />
             <Text variant="label-xs" color="onSurfaceVariant">
               Messages are end-to-end encrypted
             </Text>
          </View>

          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageBubble, 
                  isMe ? [styles.myMessage, { backgroundColor: theme.primary }] : [styles.theirMessage, { backgroundColor: theme.surfaceContainerHigh }]
                ]}
              >
                <Text variant="body-sm" style={{ color: isMe ? theme.onPrimary : theme.onSurface }}>
                  {msg.text}
                </Text>
                <Text variant="label-xs" style={{ color: isMe ? theme.onPrimary + '99' : theme.onSurfaceVariant, alignSelf: 'flex-end', marginTop: 4 }}>
                  {msg.time}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { borderTopColor: theme.glassBorder, backgroundColor: theme.surfaceSpaceElevated }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle-outline" size={28} color={theme.onSurfaceVariant} />
          </TouchableOpacity>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceContainerLow }]}>
            <TextInput
              style={[styles.input, { color: theme.onSurface }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.onSurfaceVariant}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? theme.primary : theme.surfaceContainerHigh }]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={16} color={inputText.trim() ? theme.onPrimary : theme.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  headerInfo: { flex: 1, marginLeft: 12 },
  infoBtn: { padding: 8 },
  chatArea: { padding: 16, paddingBottom: 32 },
  encryptionBanner: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, backgroundColor: '#ffffff0a'
  },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginBottom: 12 },
  myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 12, paddingVertical: 10, 
    borderTopWidth: 1,
  },
  attachBtn: { padding: 4, marginRight: 8 },
  inputWrapper: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
  input: { fontSize: 15, fontFamily: 'Inter', maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
});
