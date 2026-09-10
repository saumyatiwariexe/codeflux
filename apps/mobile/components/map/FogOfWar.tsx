import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { FOG_BOUNDARY_GEOJSON, DISCOVERED_ZONES_GEOJSON } from '../../constants/mapData';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from 'react-native';

export const FogOfWar = () => {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));

  return (
    <>
      {/* The thick fog layer covering the campus */}
      <Mapbox.ShapeSource id="fogSource" shape={FOG_BOUNDARY_GEOJSON}>
        <Mapbox.FillLayer
          id="fogFill"
          style={{
            fillColor: theme.surfaceSpaceDeep,
            fillOpacity: 0.85,
            fillOutlineColor: theme.outlineVariant,
          }}
        />
      </Mapbox.ShapeSource>

      {/* The "punched holes" representing discovered zones */}
      {/* We achieve this by drawing overlapping polygons with a lighter/transparent fill to counteract the fog,
          or explicitly coloring discovered areas. Since pure subtraction requires complex GeoJSON math,
          we will overlay glowing revealed zones on top of the fog. */}
      <Mapbox.ShapeSource id="discoveredSource" shape={DISCOVERED_ZONES_GEOJSON}>
        <Mapbox.FillLayer
          id="discoveredFill"
          style={{
            fillColor: theme.primaryContainer,
            fillOpacity: 0.6,
            fillOutlineColor: theme.primary,
          }}
        />
        <Mapbox.LineLayer
          id="discoveredLine"
          style={{
            lineColor: theme.primary,
            lineWidth: 2,
            lineDasharray: [2, 2],
          }}
        />
      </Mapbox.ShapeSource>
    </>
  );
};
