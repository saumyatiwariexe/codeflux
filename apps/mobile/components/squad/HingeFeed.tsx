import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { HingeProfileCard } from './HingeProfileCard';
import { useThemeStore } from '../../stores/useThemeStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Shared interface, extracted from SwipeCard
export interface SwipeCardData {
  id: string;
  displayName: string;
  avatarUrl?: any;
  handle: string;
  department: string;
  year: number;
  bio?: string;
  matchScore: number;
  skills?: Array<{ skill: { name: string; icon?: string }; proficiency: 'beginner' | 'intermediate' | 'expert' }>;
  campusXp?: number;
  level?: number;
  prompts?: Array<{ question: string; answer: string }>;
}

interface HingeFeedProps {
  data: SwipeCardData[];
  onLikeInteraction: (cardId: string, itemType: string, content: string, card: SwipeCardData) => void;
  onPass: (cardId: string) => void;
  onFeedEmpty: () => void;
}

export function HingeFeed({ data, onLikeInteraction, onPass, onFeedEmpty }: HingeFeedProps) {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  if (data.length === 0) {
    onFeedEmpty();
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headline-sm" style={{ color: theme.onSurfaceVariant }}>No more profiles</Text>
        <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 8 }}>
          Check back later for more people!
        </Text>
      </View>
    );
  }

  // We only show one profile at a time in the feed. Passing it removes it.
  const currentProfile = data[0];

  return (
    <View style={styles.container}>
      <FlatList
        data={[currentProfile]} // Only render the top profile, but allow scrolling through its blocks
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HingeProfileCard
            data={item}
            onLikeInteraction={(type, content) => onLikeInteraction(item.id, type, content, item)}
            onPass={() => onPass(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingActionBar}>
        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: theme.surfaceContainerHigh, borderColor: theme.glassBorder }]} onPress={() => onPass(currentProfile.id)}>
          <Ionicons name="close" size={32} color={theme.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: theme.primary, borderColor: theme.glassBorder }]} onPress={() => onLikeInteraction(currentProfile.id, 'profile', currentProfile.displayName, currentProfile)}>
          <Ionicons name="heart" size={32} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_W,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    paddingBottom: 100, // Extra padding for floating buttons
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    pointerEvents: 'box-none',
  },
  floatingBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  }
});
