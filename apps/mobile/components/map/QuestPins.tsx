import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';
import { MAP_QUESTS, MapQuest, QuestType } from '../../constants/mapData';
import { useThemeStore } from '../../stores/useThemeStore';

const { width: SCREEN_W } = Dimensions.get('window');

// ---- Color / icon mapping per quest type ----
const QUEST_META: Record<QuestType, { color: string; icon: string }> = {
  explorer: { color: '#43E97B', icon: 'compass' },
  academic: { color: '#60A5FA', icon: 'library' },
  social:   { color: '#F59E0B', icon: 'people' },
  challenge:{ color: '#FF6584', icon: 'flash' },
  daily:    { color: '#A78BFA', icon: 'sunny' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   '#43E97B',
  medium: '#F59E0B',
  hard:   '#FF6584',
};

// ---- Individual animated quest marker ----
interface QuestMarkerProps {
  quest: MapQuest;
  onPress: (quest: MapQuest) => void;
}

/**
 * A single rotating, pulsing GTA-style quest marker.
 * The outer diamond rotates continuously; the inner glow pulses.
 */
const QuestMarker: React.FC<QuestMarkerProps> = ({ quest, onPress }) => {
  const meta = QUEST_META[quest.type];

  const rotation  = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const bobY      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous spin — outer ring
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Inner glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Subtle vertical bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, { toValue: -4, duration: 900, useNativeDriver: true }),
        Animated.timing(bobY, { toValue: 0,  duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (quest.completed) {
    // Completed quests show a small greyed check — no animation
    return (
      <TouchableOpacity onPress={() => onPress(quest)} activeOpacity={0.8}>
        <View style={styles.completedMarker}>
          <Ionicons name="checkmark-circle" size={26} color="#43E97B99" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => onPress(quest)} activeOpacity={0.85}>
      <Animated.View style={[styles.markerWrapper, { transform: [{ translateY: bobY }] }]}>
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.rotatingRing,
            {
              borderColor: meta.color,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        />

        {/* Middle glow pulse */}
        <Animated.View
          style={[
            styles.glowPulse,
            {
              backgroundColor: meta.color + '30',
              transform: [{ scale: pulseScale }],
            },
          ]}
        />

        {/* Inner icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: meta.color + '22', borderColor: meta.color + '80' }]}>
          <Ionicons name={meta.icon as any} size={16} color={meta.color} />
        </View>

        {/* XP tag */}
        <View style={[styles.xpTag, { backgroundColor: meta.color }]}>
          <Text style={styles.xpText}>+{quest.xp}</Text>
        </View>

        {/* Connector stem */}
        <View style={[styles.stem, { backgroundColor: meta.color }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ---- Quest detail bottom sheet / modal ----
interface QuestDetailModalProps {
  quest: MapQuest | null;
  onClose: () => void;
}

const QuestDetailModal: React.FC<QuestDetailModalProps> = ({ quest, onClose }) => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const slideY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (quest) {
      Animated.spring(slideY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(300);
    }
  }, [quest]);

  if (!quest) return null;

  const meta = QUEST_META[quest.type];

  const handleClose = () => {
    Animated.timing(slideY, { toValue: 300, duration: 220, useNativeDriver: true }).start(onClose);
  };

  return (
    <Modal transparent animationType="none" visible={!!quest} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.surfaceSpaceElevated,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.outlineVariant }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={[styles.sheetIconBox, { backgroundColor: meta.color + '20' }]}>
            <Ionicons name={meta.icon as any} size={26} color={meta.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="headline-sm" style={{ flexShrink: 1 }}>{quest.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <Badge label={`+${quest.xp} XP`} variant="xp" />
              <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLOR[quest.difficulty] + '22', borderColor: DIFFICULTY_COLOR[quest.difficulty] + '60' }]}>
                <Text style={{ fontSize: 11, color: DIFFICULTY_COLOR[quest.difficulty], fontFamily: 'Outfit', fontWeight: '700', textTransform: 'uppercase' }}>
                  {quest.difficulty}
                </Text>
              </View>
              {quest.timeLimit && (
                <View style={[styles.diffBadge, { backgroundColor: '#FF658422', borderColor: '#FF658460' }]}>
                  <Ionicons name="time-outline" size={11} color="#FF6584" style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 11, color: '#FF6584', fontFamily: 'Inter' }}>{quest.timeLimit}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        <Text variant="body-md" color="onSurfaceVariant" style={{ marginTop: 16, lineHeight: 22 }}>
          {quest.description}
        </Text>

        {/* Accept / Navigate */}
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: meta.color }]}
          onPress={handleClose}
          activeOpacity={0.85}
        >
          <Ionicons name="flag" size={18} color="#0B0C14" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: 15, color: '#0B0C14' }}>
            Accept Quest
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// ---- Main export ----
/**
 * Renders all MAP_QUESTS as animated GTA-style markers on a Mapbox map.
 * Handles its own modal for quest details when a pin is tapped.
 */
export const QuestPins: React.FC = () => {
  const [selectedQuest, setSelectedQuest] = useState<MapQuest | null>(null);

  return (
    <>
      {MAP_QUESTS.map((quest) => (
        <Mapbox.PointAnnotation
          key={quest.id}
          id={quest.id}
          coordinate={quest.coordinates}
        >
          <QuestMarker quest={quest} onPress={setSelectedQuest} />
        </Mapbox.PointAnnotation>
      ))}

      <QuestDetailModal quest={selectedQuest} onClose={() => setSelectedQuest(null)} />
    </>
  );
};

// ---- Styles ----
const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: 'center',
    width: 56,
    height: 72,
  },
  rotatingRing: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2.5,
    transform: [{ rotate: '45deg' }],
  },
  glowPulse: {
    position: 'absolute',
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 3,
    // slight tilt to match diamond ring
    transform: [{ rotate: '45deg' }],
  },
  xpTag: {
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 11,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#0B0C14',
  },
  stem: {
    width: 2,
    height: 6,
    borderRadius: 1,
    marginTop: 1,
  },
  completedMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  // Modal / sheet
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#00000070',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sheetIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  acceptBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
