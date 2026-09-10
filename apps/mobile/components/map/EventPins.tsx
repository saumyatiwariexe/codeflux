import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { LIVE_EVENTS } from '../../constants/mapData';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';

export const EventPins = () => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <>
      {LIVE_EVENTS.map((event) => (
        <Mapbox.PointAnnotation
          key={event.id}
          id={event.id}
          coordinate={event.coordinates as [number, number]}
        >
          <View style={styles.pinContainer}>
            <View style={[styles.pulsRing, { borderColor: theme.error }]} />
            <View style={[styles.pinBubble, { backgroundColor: theme.error }]}>
               <Ionicons name="flame" size={12} color="#fff" style={{ marginRight: 4 }} />
               <Text style={{ fontSize: 10, fontFamily: 'Outfit', fontWeight: '700', color: '#fff' }}>
                 {event.title}
               </Text>
            </View>
            <View style={[styles.pinStem, { backgroundColor: theme.error }]} />
          </View>
        </Mapbox.PointAnnotation>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  pinContainer: { alignItems: 'center' },
  pulsRing: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, top: -8, opacity: 0.5
  },
  pinBubble: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
  },
  pinStem: { width: 2, height: 8, marginTop: 2 },
});
