import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, useColorScheme, TouchableOpacity, Animated, Dimensions, ScrollView, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { SwipeDeck } from '../../components/squad/SwipeDeck';
import { SwipeCardData } from '../../components/squad/SwipeCard';
import { useThemeStore } from '../../stores/useThemeStore';

const { width: SCREEN_W } = Dimensions.get('window');

type Tab = 'discover' | 'matches' | 'teams';

const MOCK_DECK: SwipeCardData[] = [
  {
    id: 'profile_1',
    displayName: 'Aarav Sharma',
    avatarUrl: require('../../assets/images/profiles/profile_1.jpg'),
    handle: 'aarav_sharma',
    department: 'CSE',
    year: 3,
    bio: 'Building blazing-fast LLM wrappers. HackLPU finalist 2025. Always up for a late night coding session.',
    matchScore: 94,
    campusXp: 8400,
    level: 5,
    skills: [
      { skill: { name: 'React' }, proficiency: 'expert' },
      { skill: { name: 'PyTorch' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'A shower thought I recently had', answer: 'If AI takes our jobs, who will buy the products the AI makes?' },
      { question: 'I geek out on', answer: 'Perfecting my vim setup and mechanical keyboards.' }
    ]
  },
  {
    id: 'profile_2',
    displayName: 'Priya Krishnan',
    avatarUrl: require('../../assets/images/profiles/profile_3.jpg'),
    handle: 'priya_design',
    department: 'Design',
    year: 2,
    bio: 'UI/UX designer and Figma wizard. Obsessed with micro-interactions and clean typography.',
    matchScore: 87,
    campusXp: 5200,
    level: 4,
    skills: [
      { skill: { name: 'Figma' }, proficiency: 'expert' },
      { skill: { name: 'Motion Design' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'My most irrational fear', answer: 'Developers using inline styles.' },
      { question: 'Typical Sunday', answer: 'Over-caffeinated at Suto Cafe trying to finish a case study.' }
    ]
  },
  {
    id: 'profile_3',
    displayName: 'Karan Ahluwalia',
    avatarUrl: require('../../assets/images/profiles/profile_2.jpg'),
    handle: 'karan_pitch',
    department: 'MBA',
    year: 1,
    bio: 'PM in training. Turn ideas into scalable products. Looking for tech co-founders for a fintech startup.',
    matchScore: 79,
    campusXp: 3400,
    level: 3,
    skills: [
      { skill: { name: 'Product Management' }, proficiency: 'intermediate' },
      { skill: { name: 'Pitching' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I am looking for', answer: 'A full-stack dev who can build an MVP in a weekend.' },
      { question: 'Best piece of advice', answer: 'Execution is everything.' }
    ]
  },
  {
    id: 'profile_4',
    displayName: 'Neha Gupta',
    handle: 'neha_writes',
    department: 'Journalism',
    year: 3,
    bio: 'Editor of the campus newsletter. Words matter. I help tech startups sound human.',
    matchScore: 82,
    campusXp: 4100,
    level: 4,
    skills: [
      { skill: { name: 'Copywriting' }, proficiency: 'expert' },
      { skill: { name: 'SEO' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'Together we could', answer: 'Write a killer pitch deck that actually gets funded.' },
    ]
  },
  {
    id: 'profile_5',
    displayName: 'Rohan Mehta',
    handle: 'rohan_robotics',
    department: 'Mechanical',
    year: 4,
    bio: 'Robotics enthusiast. Building drones and autonomous rovers. I basically live in the Mac Lab.',
    matchScore: 88,
    campusXp: 9200,
    level: 6,
    skills: [
      { skill: { name: 'CAD' }, proficiency: 'expert' },
      { skill: { name: 'C++' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'My simple pleasure', answer: 'The smell of a fresh 3D print.' },
      { question: 'I want someone who', answer: 'Knows how to tune a PID controller.' }
    ]
  },
  {
    id: 'profile_6',
    displayName: 'Zara Khan',
    handle: 'zara_cyber',
    department: 'CSE',
    year: 2,
    bio: 'Ethical hacker and CTF player. Securing systems one vulnerability at a time.',
    matchScore: 91,
    campusXp: 6100,
    level: 5,
    skills: [
      { skill: { name: 'Cybersecurity' }, proficiency: 'expert' },
      { skill: { name: 'Linux' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'Don\'t hate me if I', answer: 'Explain why your password is terrible.' },
    ]
  },
  {
    id: 'profile_7',
    displayName: 'Aditya Singh',
    handle: 'aditya_cloud',
    department: 'ECE',
    year: 3,
    bio: 'AWS certified. I love deploying things and making sure servers don\'t crash at 3 AM.',
    matchScore: 85,
    campusXp: 5800,
    level: 4,
    skills: [
      { skill: { name: 'AWS' }, proficiency: 'expert' },
      { skill: { name: 'Docker' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'My biggest flex', answer: 'Setting up a Kubernetes cluster without crying.' },
    ]
  },
  {
    id: 'profile_8',
    displayName: 'Simran Kaur',
    handle: 'simran_law',
    department: 'Law',
    year: 2,
    bio: 'Debate champion. Moot court finalist. Let me review your startup\'s terms and conditions.',
    matchScore: 76,
    campusXp: 4500,
    level: 3,
    skills: [
      { skill: { name: 'Public Speaking' }, proficiency: 'expert' },
      { skill: { name: 'Research' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'We\'re the same type of weird if', answer: 'You read the fine print on software licenses.' },
    ]
  },
  {
    id: 'profile_9',
    displayName: 'Vikram Das',
    handle: 'vikram_data',
    department: 'Data Science',
    year: 3,
    bio: 'Data is the new oil. Kaggle master. Trying to find patterns in the campus cafeteria menu.',
    matchScore: 95,
    campusXp: 7700,
    level: 5,
    skills: [
      { skill: { name: 'Python' }, proficiency: 'expert' },
      { skill: { name: 'Machine Learning' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'My love language is', answer: 'Clean datasets with no missing values.' },
    ]
  },
  {
    id: 'profile_10',
    displayName: 'Ananya Reddy',
    handle: 'ananya_arch',
    department: 'Architecture',
    year: 4,
    bio: 'Designing sustainable spaces. I know why the design block looks better than the tech block.',
    matchScore: 80,
    campusXp: 8100,
    level: 5,
    skills: [
      { skill: { name: 'AutoCAD' }, proficiency: 'expert' },
      { skill: { name: '3D Modeling' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I spend most of my money on', answer: 'Expensive coffee and rendering software.' },
    ]
  },
  {
    id: 'profile_11',
    displayName: 'Rahul Verma',
    handle: 'rahul_game',
    department: 'CSE',
    year: 2,
    bio: 'Indie game developer. Unity 3D ninja. Making the next big hit.',
    matchScore: 89,
    campusXp: 4900,
    level: 4,
    skills: [
      { skill: { name: 'Unity' }, proficiency: 'expert' },
      { skill: { name: 'C#' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'A random fact I love is', answer: 'That Mario hits the block with his fist, not his head.' },
    ]
  },
  {
    id: 'profile_12',
    displayName: 'Sneha Patel',
    handle: 'sneha_pharm',
    department: 'Pharmacy',
    year: 1,
    bio: 'Understanding the chemistry of life. Interested in health-tech apps.',
    matchScore: 72,
    campusXp: 2100,
    level: 2,
    skills: [
      { skill: { name: 'Research' }, proficiency: 'intermediate' },
      { skill: { name: 'Biology' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I\'m looking for', answer: 'A team building a med-tech startup for the upcoming hackathon.' },
    ]
  }
];

const MOCK_MATCHES = [
  { id: 'm1', name: 'Aarav Sharma', dept: 'CSE · Year 3', score: 94, lastMsg: 'Hey! Wanna team up for HackLPU?' },
  { id: 'm2', name: 'Priya Krishnan', dept: 'Design · Year 2', score: 87, lastMsg: 'Matched! I do UI/UX' },
];

export default function SquadUpScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [deck, setDeck] = useState(MOCK_DECK);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<SwipeCardData | null>(null);
  const matchModalScale = useRef(new Animated.Value(0)).current;


  const handleSwipeLeft = () => {
    // Pass logic
  };

  const handleSwipeRight = (card: SwipeCardData) => {
    // Like logic - 30% chance of a match for demo purposes
    if (Math.random() > 0.7) {
      setLastMatch(card);
      setShowMatchModal(true);
    }
  };

  const dismissMatch = () => {
    Animated.timing(matchModalScale, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatchModal(false);
      matchModalScale.setValue(0);
    });
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
                {t === 'discover' ? 'Discover' : t === 'matches' ? `Matches ${MOCK_MATCHES.length}` : 'Teams'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---- Discover Tab ---- */}
      {activeTab === 'discover' && (
        <View style={styles.deckContainer}>
          <SwipeDeck 
            data={deck} 
            onSwipeLeft={handleSwipeLeft} 
            onSwipeRight={handleSwipeRight} 
            onDeckEmpty={() => setDeck([])} 
          />
        </View>
      )}

      {/* ---- Matches Tab ---- */}
      {activeTab === 'matches' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          {MOCK_MATCHES.map((m) => (
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
                <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.primaryContainer }]}>
                  <Text variant="label-sm" style={{ color: theme.primary }}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.surfaceContainerHigh }]}>
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
            style={[styles.matchModal, { backgroundColor: theme.surfaceSpaceElevated, transform: [{ scale: matchModalScale }] }]}
          >
            <Text variant="headline-lg" style={{ textAlign: 'center', marginTop: 12 }}>You Matched!</Text>
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
              onPress={dismissMatch}
            >
              <Text variant="label-md" style={{ color: theme.onPrimary }}>Send First Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismissMatch} style={{ marginTop: 12 }}>
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
    margin: 24, borderRadius: 28, padding: 28,
    alignItems: 'center', width: SCREEN_W - 48,
  },
  matchModalAvatars: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20, marginBottom: 24 },
  modalBtn: { width: '100%', height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    pointerEvents: 'box-none'
  },
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  passBtn: {
    transform: [{ scale: 0.9 }],
  },
  likeBtn: {
    transform: [{ scale: 1.1 }],
  },
  fabIcon: {
    fontSize: 28,
    fontFamily: 'Outfit',
    fontWeight: 'bold',
  }
});
