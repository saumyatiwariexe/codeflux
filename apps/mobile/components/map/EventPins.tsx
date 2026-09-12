import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { LIVE_EVENTS } from '../../constants/mapData';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';

export const EventPins = () => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <>
      {LIVE_EVENTS.map((event) => (
        <Mapbox.PointAnnotation
          key={event.id}
          id={event.id}
          coordinate={event.coordinates as [number, number]}
          onSelected={() => setSelectedEventId(event.id)}
          onDeselected={() => setSelectedEventId(null)}
        >
          <View style={styles.pinContainer}>
            <Ionicons name="location-sharp" size={32} color={theme.error} />
          </View>
          {selectedEventId === event.id && (
            <Mapbox.Callout title={event.title}>
              <View style={[styles.calloutContainer, { backgroundColor: theme.card }]}>
                <Text style={{ fontSize: 14, fontFamily: 'Outfit', fontWeight: '700', color: theme.text }}>
                  {event.title}
                </Text>
              </View>
            </Mapbox.Callout>
          )}
        </Mapbox.PointAnnotation>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  pinContainer: { alignItems: 'center', justifyContent: 'center' },
  calloutContainer: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
