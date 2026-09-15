import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

export interface ChatThread {
  id: string;
  name: string;
  msg: string;
  time: string;
  unread: number;
  type: 'squad' | 'group' | 'direct';
  messages: ChatMessage[];
}

const INITIAL_CHATS: ChatThread[] = [
  { 
    id: '1', name: 'Aarav Sharma', msg: 'Hey! Saw we matched on SquadUp. You doing HackLPU?', time: '2m', unread: 1, type: 'squad',
    messages: [
      { id: 'm1', text: 'Hey! Saw we matched on SquadUp.', sender: 'them', time: '10:41 AM' },
      { id: 'm2', text: 'Are you doing HackLPU?', sender: 'them', time: '10:41 AM' },
      { id: 'm3', text: 'Yes! Im looking for a frontend dev for my idea.', sender: 'me', time: '10:43 AM' },
      { id: 'm4', text: 'Awesome, Im solid with React Native. What is the problem statement?', sender: 'them', time: '10:45 AM' },
    ]
  },
  { 
    id: '2', name: 'GDSC Core Team', msg: 'Reminder: Friday session moved to Block 32.', time: '1h', unread: 0, type: 'group',
    messages: [
      { id: 'm1', text: 'Meeting is at 4 PM today.', sender: 'them', time: '2:00 PM' },
      { id: 'm2', text: 'Reminder: Friday session moved to Block 32.', sender: 'them', time: '3:00 PM' },
    ]
  },
  { 
    id: '3', name: 'Neha S.', msg: 'Are you taking the Cloud Computing elective?', time: 'Yesterday', unread: 0, type: 'direct',
    messages: [
      { id: 'm1', text: 'Are you taking the Cloud Computing elective?', sender: 'them', time: 'Yesterday' },
      { id: 'm2', text: 'Yeah, I picked AWS track.', sender: 'me', time: 'Yesterday' },
    ]
  },
];

interface ChatState {
  chats: ChatThread[];
  addChat: (chat: ChatThread) => void;
  updateChat: (id: string, msg: string) => void;
  addMessage: (chatId: string, message: ChatMessage, roomName?: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: INITIAL_CHATS,
      addChat: (chat) => set((state) => {
        if (state.chats.some(c => c.id === chat.id)) return state;
        return { chats: [{ ...chat, messages: chat.messages || [] }, ...state.chats] };
      }),
      updateChat: (id, msg) => set((state) => ({
        chats: state.chats.map(c => c.id === id ? { ...c, msg, time: 'Just now' } : c)
      })),
      addMessage: (chatId, message, roomName) => set((state) => {
        const chatExists = state.chats.some(c => c.id === chatId);
        if (!chatExists) return state; // Only add to existing chats
        
        return {
          chats: state.chats.map(c => {
            if (c.id === chatId) {
              const msgs = c.messages || [];
              // Avoid duplicates if we broadcasted to ourselves
              if (msgs.some(m => m.id === message.id)) return { ...c, name: roomName || c.name };
              return { 
                ...c, 
                name: roomName || c.name,
                messages: [...msgs, message],
                msg: message.text,
                time: message.time,
                unread: message.sender === 'them' ? c.unread + 1 : 0
              };
            }
            return c;
          })
        };
      })
    }),
    {
      name: 'pulsechat-storage', // unique name for AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
