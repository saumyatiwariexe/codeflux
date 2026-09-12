import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Modal, Image, TouchableOpacity,
  Dimensions, Animated, PanResponder, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from 'react-native';

const { width, height } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  stories: any[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  const progress = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      startAnimation();
    } else {
      progress.setValue(0);
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    if (visible) {
      startAnimation();
    }
  }, [currentIndex]);

  const startAnimation = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      progress.setValue(0);
      startAnimation(); // Restart first story
    }
  };

  const handlePress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < width * 0.3) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20; // Only capture vertical swipes
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) { // Swipe down to close
          onClose();
          panY.setValue(0);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!visible || !stories.length) return null;

  const currentStory = stories[currentIndex];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View
        style={[styles.container, { width, height, transform: [{ translateY: panY }] }]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: currentStory.imageUrl }}
          style={styles.imageBg}
          resizeMode="cover"
        />
        {/* Overlay gradient - reduced for better photo visibility */}
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />

        <SafeAreaView style={styles.safeArea}>
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {stories.map((_, index) => {
              return (
                <View key={index} style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: '#fff',
                        width: index === currentIndex
                          ? progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : index < currentIndex ? '100%' : '0%',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerUser}>
              <View style={styles.avatar}>
                <Image source={{ uri: currentStory.imageUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              </View>
              <View>
                <Text variant="label-md" style={styles.textWhite}>{currentStory.name}</Text>
                <Text variant="label-xs" style={styles.textWhiteGhost}>{currentStory.role}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Tap Zones */}
          <TouchableOpacity activeOpacity={1} style={styles.tapZone} onPress={handlePress}>
             {/* Just the tap zone to navigate, no text block blocking the photo */}
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  imageBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)', // Darken for readability
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#6C63FF', // Primary color for stories
    padding: 2,
  },
  textWhite: {
    color: '#fff',
  },
  textWhiteGhost: {
    color: 'rgba(255,255,255,0.8)',
  },
  closeBtn: {
    padding: 4,
  },
  tapZone: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  }
});
