import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';

import { FogOfWar } from './FogOfWar';
import { EventPins } from './EventPins';

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
          followUserLocation={true}
          followUserMode="course"
          followZoomLevel={17}
          followPitch={60}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* 3D Buildings Layer */}
        <Mapbox.VectorSource id="building-source" url="mapbox://mapbox.mapbox-streets-v8">
          <Mapbox.FillExtrusionLayer
            id="building3d"
            sourceLayerID="building"
            style={{
              fillExtrusionOpacity: 0.8,
              fillExtrusionHeight: ['get', 'height'],
              fillExtrusionBase: ['get', 'min_height'],
              fillExtrusionColor: systemColorScheme === 'dark' ? '#333333' : '#e0e0e0',
            }}
          />
        </Mapbox.VectorSource>

        {/* Player Location */}
        <Mapbox.UserLocation 
          visible={true}
          showsUserHeadingIndicator={true}
        />
        
        <FogOfWar />
        
        {activeLayer === 'all' || activeLayer === 'events' ? (
          <EventPins />
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
