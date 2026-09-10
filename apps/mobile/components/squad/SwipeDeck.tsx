import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder, useColorScheme } from 'react-native';
import { SwipeCard, SwipeCardData } from './SwipeCard';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { useThemeStore } from '../../stores/useThemeStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_W;
const SWIPE_OUT_DURATION = 250;

interface SwipeDeckProps {
  data: SwipeCardData[];
  onSwipeLeft: (card: SwipeCardData) => void;
  onSwipeRight: (card: SwipeCardData) => void;
  onDeckEmpty: () => void;
}

export function SwipeDeck({ data, onSwipeLeft, onSwipeRight, onDeckEmpty }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_W : -SCREEN_W;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const item = data[index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    position.setValue({ x: 0, y: 0 });
    setIndex(index + 1);
    if (index + 1 >= data.length) {
      onDeckEmpty();
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_W * 1.5, 0, SCREEN_W * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderCards = () => {
    if (index >= data.length) {
      return (
        <View style={styles.emptyDeck}>
          <Text variant="headline-sm" style={{ marginTop: 16, textAlign: 'center' }}>You've seen everyone!</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center' }}>
            Check back tomorrow for new profiles. Your matches are waiting.
          </Text>
        </View>
      );
    }

    return data.map((item, i) => {
      if (i < index) return null;

      if (i === index) {
        return (
          <Animated.View
            key={item.id}
            style={[getCardStyle(), styles.cardStyle]}
            {...panResponder.panHandlers}
          >
            {/* Swipe Labels */}
            <Animated.View style={[styles.nopeLabel, { opacity: position.x.interpolate({ inputRange: [-SCREEN_W / 2, 0], outputRange: [1, 0], extrapolate: 'clamp' }) }]}>
              <Text variant="headline-lg" style={{ color: theme.error, fontWeight: 'bold' }}>PASS</Text>
            </Animated.View>
            <Animated.View style={[styles.likeLabel, { opacity: position.x.interpolate({ inputRange: [0, SCREEN_W / 2], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
              <Text variant="headline-lg" style={{ color: theme.primary, fontWeight: 'bold' }}>LIKE</Text>
            </Animated.View>

            <SwipeCard data={item} />
          </Animated.View>
        );
      }

      // Next card rendered underneath without pan handlers
      return (
        <Animated.View key={item.id} style={[styles.cardStyle, { top: 10 * (i - index), zIndex: -i }]}>
          <SwipeCard data={item} />
        </Animated.View>
      );
    }).reverse();
  };

  return <View style={styles.container}>{renderCards()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  cardStyle: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H - 180,
  },
  emptyDeck: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  nopeLabel: {
    position: 'absolute', top: 50, right: 40, zIndex: 10,
    transform: [{ rotate: '15deg' }], borderWidth: 4, borderColor: '#ff4b4b',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10
  },
  likeLabel: {
    position: 'absolute', top: 50, left: 40, zIndex: 10,
    transform: [{ rotate: '-15deg' }], borderWidth: 4, borderColor: '#6C63FF',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10
  }
});
