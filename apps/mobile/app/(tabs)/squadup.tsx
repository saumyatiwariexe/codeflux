import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, useColorScheme, TouchableOpacity, Animated, Dimensions, ScrollView, FlatList, LayoutAnimation, UIManager, Platform, Alert
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { HingeFeed, SwipeCardData } from '../../components/squad/HingeFeed';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { supabase } from '../../services/supabase';

const { width: SCREEN_W } = Dimensions.get('window');

type Tab = 'discover' | 'matches' | 'teams';

export const MOCK_DECK: SwipeCardData[] = [];

const MOCK_MATCHES: any[] = [];

export default function SquadUpScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const user = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  
  const [deck, setDeck] = useState<SwipeCardData[]>(() => {
    if (user?.email?.toLowerCase().includes('sameersingh')) {
      return MOCK_DECK.filter(p => p.id !== 'profile_saumya');
    }
    if (user?.email?.toLowerCase().includes('rishabhdubey')) {
      return MOCK_DECK.filter(p => p.id !== 'rishabhdubey@lpu.in');
    }
    return MOCK_DECK;
  });

  // Force sync on fast refresh
  React.useEffect(() => {
    if (user?.email?.toLowerCase().includes('sameersingh')) {
      setDeck(MOCK_DECK.filter(p => p.id !== 'profile_saumya'));
    } else if (user?.email?.toLowerCase().includes('rishabhdubey')) {
      setDeck(MOCK_DECK.filter(p => p.id !== 'rishabhdubey@lpu.in'));
    } else {
      setDeck(MOCK_DECK);
    }
  }, [user?.email]);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<SwipeCardData | null>(null);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const matchModalScale = useRef(new Animated.Value(0)).current;

  // Real-time Subscriptions
  React.useEffect(() => {
    if (!user?.email) return;
    
    const channel = supabase.channel('squadup_sync')
      .on('broadcast', { event: 'new_match' }, (payload) => {
        const { to, matchData } = payload.payload;
        if (to === user.email.toLowerCase()) {
          setLastMatch(matchData);
          setShowMatchModal(true);
          Animated.spring(matchModalScale, { 
            toValue: 1, stiffness: 250, damping: 15, useNativeDriver: true 
          }).start();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  const MY_TECH_STACK = ['React', 'Node.js', 'MongoDB', 'Python', 'TailwindCSS'];

  const handleLike = (cardId: string, itemType: string, content: string, card: SwipeCardData) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeck(prev => prev.filter(c => c.id !== cardId));
    
    // Check if the profile has any tech stack overlap with the current user
    const hasSimilarTech = card.skills?.some(s => MY_TECH_STACK.includes(s.skill.name));
    
    if (hasSimilarTech) {
      setLastMatch(card);
      setShowMatchModal(true);
      Animated.spring(matchModalScale, { 
        toValue: 1, 
        stiffness: 250, 
        damping: 15, 
        useNativeDriver: true 
      }).start();

      // Broadcast the match to the other user's device
      // We pass our own mock profile data so they see us in the match popup
      const myProfileAsCard: SwipeCardData = {
        id: user?.email || 'admin-id',
        displayName: user?.email?.includes('rishabh') ? 'Rishabh Dubey' : 'Saumya Tiwari',
        avatarUrl: { uri: user?.email?.includes('rishabh') ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' : 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png' },
        handle: user?.email?.split('@')[0] || 'user',
        department: 'BCA',
        year: 1,
        bio: 'Ready to build something awesome.',
        matchScore: 99,
        campusXp: 9500,
        level: 6,
        skills: [],
        prompts: []
      };

      supabase.channel('squadup_sync').send({
        type: 'broadcast',
        event: 'new_match',
        payload: {
          to: card.id, // we mapped Rishabh's card ID to his email above
          matchData: myProfileAsCard
        }
      });
    }
  };

  const handlePass = (cardId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeck(prev => prev.filter(c => c.id !== cardId));
  };

  const dismissMatch = () => {
    Animated.timing(matchModalScale, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatchModal(false);
      matchModalScale.setValue(0);
    });
  };

  const addCurrentMatch = () => {
    if (lastMatch) {
      const newMatch = {
        id: lastMatch.id,
        name: lastMatch.displayName,
        dept: `${lastMatch.department} · Year ${lastMatch.year}`,
        score: lastMatch.matchScore || 90,
        lastMsg: 'You matched! Send a message.'
      };
      setMatches(prev => {
        if (!prev.some(m => m.id === newMatch.id)) {
          return [newMatch, ...prev];
        }
        return prev;
      });
    }
  };

  const handleSendMessage = () => {
    addCurrentMatch();
    if (lastMatch) {
      const myId = user?.email || 'admin-id';
      const theirId = lastMatch.id;
      const roomId = [myId, theirId].sort().join('_');

      useChatStore.getState().addChat({
        id: roomId,
        name: lastMatch.displayName,
        msg: 'You matched! Send a message.',
        time: 'Just now',
        unread: 0,
        type: 'squad'
      });
      router.push({ pathname: '/pulsechat/[id]', params: { id: roomId, name: lastMatch.displayName } });
    }
    dismissMatch();
  };

  const handleKeepDiscovering = () => {
    addCurrentMatch();
    dismissMatch();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.glassBorder }]}>
        <Text variant="headline-sm" style={styles.title}>SquadUp</Text>
        <View style={styles.tabs}>
          {(['discover', 'matches', 'teams'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(t)}
            >
              <Text variant="label-sm" style={{ color: activeTab === t ? theme.primary : theme.onSurfaceVariant }}>
                {t === 'discover' ? 'Discover' : t === 'matches' ? `Matches (${matches.length})` : 'Teams'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---- Discover Tab ---- */}
      {activeTab === 'discover' && (
        <View style={styles.deckContainer}>
          <HingeFeed 
            data={deck} 
            onLikeInteraction={handleLike} 
            onPass={handlePass} 
            onFeedEmpty={() => setDeck([])} 
          />
        </View>
      )}

      {/* ---- Matches Tab ---- */}
      {activeTab === 'matches' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          {matches.map((m) => (
            <Card key={m.id} variant="default" style={styles.matchCard}>
              <View style={styles.matchRow}>
                <Avatar displayName={m.name} size={52} showOnlineDot isOnline />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.matchHeader}>
                    <Text variant="headline-sm">{m.name}</Text>
                    <Badge label={` ${m.score}%`} variant="squad" />
                  </View>
                  <Text variant="body-sm" color="onSurfaceVariant">{m.dept}</Text>
                  <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 4 }} numberOfLines={1}>
                    {m.lastMsg}
                  </Text>
                </View>
              </View>
              <View style={styles.matchActions}>
                <TouchableOpacity 
                  style={[styles.msgBtn, { backgroundColor: theme.primaryContainer }]}
                  onPress={() => {
                    const myId = user?.email || 'admin-id';
                    const theirId = m.id;
                    const roomId = [myId, theirId].sort().join('_');

                    useChatStore.getState().addChat({
                      id: roomId,
                      name: m.name,
                      msg: m.lastMsg || 'Start chatting...',
                      time: 'Just now',
                      unread: 0,
                      type: 'squad'
                    });
                    router.push({ pathname: '/pulsechat/[id]', params: { id: roomId, name: m.name } });
                  }}
                >
                  <Text variant="label-sm" style={{ color: theme.primary }}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.msgBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                  onPress={() => Alert.alert('Profile', 'Profile view coming soon!')}
                >
                  <Text variant="label-sm" color="onSurfaceVariant">View Profile</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* ---- Teams Tab ---- */}
      {activeTab === 'teams' && (
        <View style={[styles.tabContent, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
          <Text variant="headline-sm" style={{ marginTop: 16 }}>No teams yet</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
            Match with 2+ people and form a team for a hackathon or project.
          </Text>
        </View>
      )}

      {/* ---- Match Celebration Modal ---- */}
      {showMatchModal && lastMatch && (
        <TouchableOpacity style={styles.modalBackdrop} onPress={dismissMatch} activeOpacity={1}>
          <Animated.View
            style={[styles.matchModal, { 
              backgroundColor: theme.surfaceSpaceElevated, 
              borderColor: theme.glassBorder,
              borderWidth: 1,
              transform: [{ scale: matchModalScale }] 
            }]}
          >
            <Text variant="headline-lg" color="primary" style={{ textAlign: 'center', marginTop: 12 }}>You Matched!</Text>
            <Text variant="body-md" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: 6 }}>
              You and {lastMatch.displayName} both liked each other
            </Text>
            <View style={styles.matchModalAvatars}>
              <Avatar displayName="You" size={64} />
              <Ionicons name="add" size={24} color={theme.onSurfaceVariant} />
              <Avatar displayName={lastMatch.displayName} size={64} />
            </View>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.primary }]}
              onPress={handleSendMessage}
            >
              <Text variant="label-md" style={{ color: theme.onPrimary }}>Send First Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleKeepDiscovering} style={{ marginTop: 12 }}>
              <Text variant="label-sm" color="onSurfaceVariant">Keep Discovering</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { paddingHorizontal: 20, paddingTop: 8, borderBottomWidth: 1 },
  title: { marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 24 },
  tab: { paddingBottom: 10 },
  deckContainer: { flex: 1 },
  emptyDeck: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  tabContent: { padding: 20, paddingBottom: 100 },
  matchCard: { padding: 16, marginBottom: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  msgBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  matchModal: {
    margin: 24, borderRadius: 32, padding: 28,
    alignItems: 'center', width: SCREEN_W - 48,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  matchModalAvatars: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20, marginBottom: 24 },
  modalBtn: { width: '100%', height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
