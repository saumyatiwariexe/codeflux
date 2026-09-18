import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, PanResponder } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../../stores/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as turf from '@turf/turf';
import { LIVE_EVENTS, MAP_QUESTS } from '../../constants/mapData';

// Initialize Mapbox with public key
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2R1bW15In0.dummy');

interface MapCanvasProps {
  activeLayer: string;
  mapMode: '3rd-person' | 'world-map';
  initialCoords: [number, number];
}

const LPU_COORDINATES = [75.7051, 31.2560];

// The outer bounds of the fog (massive area to cover any possible zoom out)
const fogBoundingBox = turf.polygon([[
  [65.0, 40.0],
  [85.0, 40.0],
  [85.0, 20.0],
  [65.0, 20.0],
  [65.0, 40.0]
]]);

// Distance helper
const getDistance = (p1: [number, number], p2: [number, number]) => {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
};

// Bearing helper (calculates angle between two coordinates)
const getBearing = (start: [number, number], end: [number, number]) => {
  const startLat = (start[1] * Math.PI) / 180;
  const startLng = (start[0] * Math.PI) / 180;
  const endLat = (end[1] * Math.PI) / 180;
  const endLng = (end[0] * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  const theta = Math.atan2(y, x);
  let brng = (theta * 180) / Math.PI;
  return (brng + 360) % 360;
};

export const MapCanvas: React.FC<MapCanvasProps> = ({ activeLayer, mapMode, initialCoords }) => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [isWalking, setIsWalking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const walkTimeout = useRef<NodeJS.Timeout | null>(null);

  const animatedPoint = useRef(new Mapbox.AnimatedPoint({
    type: 'Point',
    coordinates: initialCoords
  })).current;

  const [userCoords, setUserCoords] = useState<[number, number]>(initialCoords);
  const [characterHeading, setCharacterHeading] = useState(0); // Movement bearing for 3D model
  const lastCoordsRef = useRef<[number, number]>(initialCoords);
  const [visitedCenters, setVisitedCenters] = useState<[number, number][]>([]);

  // TPP Camera State
  const [tppHeading, setTppHeading] = useState(0);
  const [tppPitch, setTppPitch] = useState(85);
  const startHeadingRef = useRef(0);
  const startPitchRef = useRef(85);
  // We need a ref to hold the latest state for the RNGH closure
  const latestTppHeading = useRef(tppHeading);
  const latestTppPitch = useRef(tppPitch);
  latestTppHeading.current = tppHeading;
  latestTppPitch.current = tppPitch;

  // Camera transition effect
  useEffect(() => {
    setIsTransitioning(true);

    if (mapMode === 'world-map') {
      setIsFollowingUser(false);
      cameraRef.current?.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 16.2,
        pitch: 0,
        heading: 0,
        animationDuration: 1500,
      });
    } else {
      setIsFollowingUser(true);
      setTppHeading(0);
      setTppPitch(85);
      cameraRef.current?.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 21.5,
        pitch: 85,
        heading: 0, // Reset to North
        animationDuration: 1500,
      });
    }

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [mapMode]);

  useEffect(() => {
    let locSub: Location.LocationSubscription;
    let headSub: Location.LocationSubscription;
    
    (async () => {
      try {
        locSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            const newCoords: [number, number] = [loc.coords.longitude, loc.coords.latitude];
            setUserCoords(newCoords);
            animatedPoint.timing({
              coordinates: newCoords,
              duration: 800,
            }).start();

            // Calculate movement bearing to rotate the character
            const distance = getDistance(lastCoordsRef.current, newCoords);
            if (distance > 0.000005) { // Roughly 0.5 meters
              const newBearing = getBearing(lastCoordsRef.current, newCoords);
              setCharacterHeading(newBearing);
            }
            lastCoordsRef.current = newCoords;

            // Dynamic trail discovery logic
            setVisitedCenters(prev => {
              if (prev.length === 0) return [newCoords];
              const last = prev[prev.length - 1];
              // Only drop a new permanent hole every ~40 meters to save memory
              if (getDistance(last, newCoords) > 0.0004) {
                return [...prev, newCoords];
              }
              return prev;
            });
          }
        );
      } catch (e) {
        console.warn("Location watch failed", e);
      }
    })();
    
    return () => {
      locSub?.remove();
    };
  }, [isFollowingUser, mapMode]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > 1.2 || magnitude < 0.8) {
        setIsWalking(true);
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        walkTimeout.current = setTimeout(() => {
          setIsWalking(false);
        }, 800);
      }
    });

    return () => {
      subscription?.remove();
      if (walkTimeout.current) clearTimeout(walkTimeout.current);
    };
  }, []);

  const styleURL = systemColorScheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  // Build the dynamic fog shape using Turf.js
  const fogFeature = useMemo(() => {
    // 0.02 kilometers = 20 meters
    const RADIUS_KM = 0.02; 
    
    let holes = [turf.circle(userCoords, RADIUS_KM)];
    visitedCenters.forEach(c => {
      holes.push(turf.circle(c, RADIUS_KM));
    });

    // Union all holes into a single multipolygon to prevent intersection bugs
    let combinedHoles = holes[0];
    for (let i = 1; i < holes.length; i++) {
      // union can return Feature or FeatureCollection, but mostly Feature<Polygon | MultiPolygon>
      combinedHoles = turf.union(turf.featureCollection([combinedHoles, holes[i]])) as any;
    }

    // Mask the bounding box with our holes (punches the holes perfectly)
    const maskedPolygon = turf.mask(combinedHoles, fogBoundingBox);

    return maskedPolygon;
  }, [userCoords, visitedCenters]);

  // Build the scalable geographical arrow for the world map
  const cursorFeature = useMemo(() => {
    // Lengths in kilometers (0.015km = 15 meters)
    const tip = turf.destination(userCoords, 0.015, characterHeading, { units: 'kilometers' }).geometry.coordinates;
    const br = turf.destination(userCoords, 0.008, characterHeading + 140, { units: 'kilometers' }).geometry.coordinates;
    // Add a slight indent in the back of the arrow for a cooler "jet" shape
    const back = turf.destination(userCoords, 0.002, characterHeading + 180, { units: 'kilometers' }).geometry.coordinates;
    const bl = turf.destination(userCoords, 0.008, characterHeading - 140, { units: 'kilometers' }).geometry.coordinates;
    
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[tip, br, back, bl, tip]]
      }
    };
  }, [userCoords, characterHeading]);

  // Build points for Events and Quests
  const eventFeatures = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: LIVE_EVENTS.map(evt => ({
        type: 'Feature',
        properties: { id: evt.id, title: evt.title, type: 'event' },
        geometry: { type: 'Point', coordinates: evt.coordinates }
      }))
    };
  }, []);

  const questFeatures = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: MAP_QUESTS.map(q => ({
        type: 'Feature',
        properties: { id: q.id, title: q.title, type: 'quest' },
        geometry: { type: 'Point', coordinates: q.coordinates }
      }))
    };
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView 
        style={styles.map} 
        styleURL={styleURL}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
        zoomEnabled={mapMode === 'world-map'}
        scrollEnabled={mapMode === 'world-map'}
        pitchEnabled={mapMode === 'world-map'}
        rotateEnabled={false}
        pointerEvents={mapMode === '3rd-person' ? 'none' : 'auto'}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={isFollowingUser ? userCoords : undefined}
          zoomLevel={mapMode === 'world-map' ? 16.2 : 21.5}
          pitch={mapMode === 'world-map' ? 0 : tppPitch}
          heading={mapMode === 'world-map' ? 0 : tppHeading}
          animationDuration={mapMode === 'world-map' ? 1500 : 50}
          minZoomLevel={16.2} // Further zoomed out
          maxBounds={{
            ne: [75.72, 31.27],
            sw: [75.69, 31.24],
          }}
        />

        {/* 3D Character */}
        <Mapbox.Models
          models={{
            character_idle: 'asset://character_idle.glb',
            character_stride: 'asset://character_stride.glb'
          }}
        />

        {userCoords && (mapMode === '3rd-person' || isTransitioning) && (
          <Mapbox.ShapeSource
            id="player-source"
            shape={animatedPoint as any}
          >
            <Mapbox.ModelLayer
              key={`player-model-${isWalking}-0-0`}
              id="player-model"
              style={{
                modelId: isWalking ? 'character_stride' : 'character_idle',
                modelScale: [0.04, 0.04, 0.04],
                modelRotation: [90, 0, characterHeading + 180],
                modelTranslation: [0, 0, -8.6],
                modelOpacity: 1,
              } as any}
            />
          </Mapbox.ShapeSource>
        )}

        {/* World Map Navigation Cursor (Geographical, scales with map) */}
        {userCoords && mapMode === 'world-map' && !isTransitioning && (
          <Mapbox.ShapeSource id="cursor-source" shape={cursorFeature as any}>
            <Mapbox.FillLayer
              id="cursor-fill"
              style={{
                fillColor: '#3b82f6',
                fillOpacity: 0.9,
              }}
            />
            <Mapbox.LineLayer
              id="cursor-stroke"
              style={{
                lineColor: '#ffffff',
                lineWidth: 3,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Gamification Data Layers (Events / Quests) */}
        <Mapbox.ShapeSource id="events-source" shape={eventFeatures as any}>
          <Mapbox.CircleLayer
            id="events-layer"
            style={{
              circleRadius: mapMode === 'world-map' ? 6 : 12,
              circleColor: '#3b82f6', // blue
              circleStrokeWidth: 2,
              circleStrokeColor: '#ffffff',
            }}
          />
        </Mapbox.ShapeSource>

        <Mapbox.ShapeSource id="quests-source" shape={questFeatures as any}>
          <Mapbox.CircleLayer
            id="quests-layer"
            style={{
              circleRadius: mapMode === 'world-map' ? 6 : 12,
              circleColor: '#10b981', // green
              circleStrokeWidth: 2,
              circleStrokeColor: '#ffffff',
            }}
          />
        </Mapbox.ShapeSource>

        {/* Fog of War Layer */}
        {mapMode === 'world-map' && (
          <Mapbox.ShapeSource id="fog-source" shape={fogFeature as any}>
            <Mapbox.FillLayer
              id="fog-fill"
              style={{
                fillColor: '#000000',
                fillOpacity: 0.8,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Custom Game Map Aesthetic */}
        <Mapbox.BackgroundLayer 
          id="game-bg" 
          style={{ backgroundColor: '#A8D08D' }} 
        />

        <Mapbox.VectorSource id="composite" url="mapbox://mapbox.mapbox-streets-v8">
          <Mapbox.FillLayer id="game-water" sourceLayerID="water" style={{ fillColor: '#7EC8E3', fillOpacity: 0.9 }} />
          <Mapbox.FillLayer id="game-landuse" sourceLayerID="landuse" style={{ fillColor: '#79B45D', fillOpacity: 0.5 }} />
          <Mapbox.LineLayer id="game-roads" sourceLayerID="road" style={{ lineColor: '#FFFFFF', lineWidth: 4, lineOpacity: 0.8 }} />
          
          <Mapbox.FillExtrusionLayer
            id="3d-buildings"
            sourceLayerID="building"
            filter={['==', 'extrude', 'true']}
            minZoomLevel={15}
            maxZoomLevel={22}
            style={{
              fillExtrusionColor: theme.surfaceContainerHighest,
              fillExtrusionHeight: ['get', 'height'] as any,
              fillExtrusionBase: ['get', 'min_height'] as any,
              fillExtrusionOpacity: 0.8,
            }}
          />
        </Mapbox.VectorSource>

        <Mapbox.Atmosphere
          style={{
            color: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for soft fog
            highColor: '#87ceeb',
            spaceColor: '#87ceeb',
            starIntensity: 0,
            horizonBlend: 0.02 // Tighter, less intrusive blend
          }}
        />
        

      </Mapbox.MapView>

      {/* TPP 360 Swipe Camera Controller (RNGH overlay) */}
      {mapMode === '3rd-person' && (
        <PanGestureHandler
          onHandlerStateChange={(evt) => {
            if (evt.nativeEvent.state === State.BEGAN) {
              startHeadingRef.current = latestTppHeading.current;
              startPitchRef.current = latestTppPitch.current;
            }
          }}
          onGestureEvent={(evt) => {
            const { translationX, translationY } = evt.nativeEvent;
            const SENSITIVITY_X = 0.5;
            const SENSITIVITY_Y = 0.4;
            
            let newHeading = startHeadingRef.current - (translationX * SENSITIVITY_X);
            while (newHeading < 0) newHeading += 360;
            while (newHeading >= 360) newHeading -= 360;
            
            let newPitch = startPitchRef.current - (translationY * SENSITIVITY_Y);
            newPitch = Math.max(30, Math.min(85, newPitch));

            setTppHeading(newHeading);
            setTppPitch(newPitch);
          }}
        >
          <View 
            style={[
              StyleSheet.absoluteFillObject, 
              { backgroundColor: 'rgba(255, 255, 255, 0.01)', zIndex: 999, elevation: 10 }
            ]}
          />
        </PanGestureHandler>
      )}

      {/* Recenter Button (Only in world map mode) */}
      {mapMode === 'world-map' && (
        <TouchableOpacity 
          style={[styles.recenterBtn, { backgroundColor: theme.surfaceSpaceElevated }]}
          onPress={() => {
            if (mapMode === '3rd-person') {
              setIsFollowingUser(true);
              setTppHeading(0);
              setTppPitch(85);
              cameraRef.current?.setCamera({
                centerCoordinate: userCoords,
                heading: 0, // Reset to North
                zoomLevel: 21.5,
                pitch: 85,
                animationDuration: 1000,
              });
            } else {
              // In World Map, just fly to the user but allow them to keep panning after
              cameraRef.current?.setCamera({
                centerCoordinate: userCoords,
                heading: 0,
                zoomLevel: 16.2,
                pitch: 0,
                animationDuration: 1000,
              });
            }
          }}
        >
          <Ionicons name="navigate" size={24} color={theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  recenterBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});
