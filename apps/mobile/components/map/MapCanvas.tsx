import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';

import { EventPins } from './EventPins';
import { QuestPins } from './QuestPins';


// Initialize Mapbox with public key
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

interface MapCanvasProps {
  activeLayer: string;
}

const LPU_COORDINATES = [75.7051, 31.2560];

export const MapCanvas: React.FC<MapCanvasProps> = ({ activeLayer }) => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  // Determine Mapbox style URL based on theme
  const styleURL = systemColorScheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  return (
    <View style={styles.container}>
      <Mapbox.MapView 
        style={styles.map} 
        styleURL={styleURL}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={15.5}
          centerCoordinate={LPU_COORDINATES}
          pitch={45}
        />
        
        {activeLayer === 'all' || activeLayer === 'events' ? (
          <EventPins />
        ) : null}

        {activeLayer === 'all' || activeLayer === 'quests' ? (
          <QuestPins />
        ) : null}


      </Mapbox.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
