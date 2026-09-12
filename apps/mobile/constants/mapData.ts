// Approximate coordinates for Lovely Professional University (LPU)
export const LPU_CENTER = [75.7051, 31.2560];

// A large polygon covering the general area to act as the "Fog of War"
export const FOG_BOUNDARY_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [75.6900, 31.2700],
          [75.7200, 31.2700],
          [75.7200, 31.2400],
          [75.6900, 31.2400],
          [75.6900, 31.2700],
        ]],
      },
    },
  ],
};

// Mock Discovered Zones (holes in the fog)
// For simplicity in Mapbox, we can draw these as separate overlapping layers 
// or use turf.js to cut holes. Here we provide them as individual polygons.
const createCirclePolygon = (center: [number, number], radius = 0.002) => {
  const points = 32;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const dx = radius * Math.cos((angle * Math.PI) / 180);
    // Adjust for latitude scaling roughly
    const dy = (radius * Math.sin((angle * Math.PI) / 180)) * 0.85;
    coords.push([center[0] + dx, center[1] + dy]);
  }
  coords.push(coords[0]); // close the polygon
  return [coords];
};

export const DISCOVERED_ZONES_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { id: 'tech', label: 'Tech District' },
      geometry: { type: 'Polygon' as const, coordinates: createCirclePolygon([75.7030, 31.2580], 0.003) },
    },
    {
      type: 'Feature' as const,
      properties: { id: 'food', label: 'Food Court' },
      geometry: { type: 'Polygon' as const, coordinates: createCirclePolygon([75.7070, 31.2540], 0.002) },
    },
    {
      type: 'Feature' as const,
      properties: { id: 'sports', label: 'Sports Complex' },
      geometry: { type: 'Polygon' as const, coordinates: createCirclePolygon([75.7010, 31.2530], 0.0025) },
    },
  ],
};

// Mock Events for Pins
export const LIVE_EVENTS = [
  { id: 'new_e0', title: 'WEB-A-THON 2.0 | LPU’s Next Big Hackathon', coordinates: [75.70418188756499, 31.25780198350727], type: 'event' },
  { id: 'new_e1', title: 'Code Heist Hackathon', coordinates: [75.70403943144836, 31.25752908810706], type: 'event' },
  { id: 'new_e2', title: 'Code2Career AI Hackathon', coordinates: [75.70520968892794, 31.257884891805208], type: 'event' },
  { id: 'new_e3', title: 'Anime Night 2.0', coordinates: [75.702, 31.259], type: 'event' },
  { id: 'new_e4', title: 'GOAL RUSH', coordinates: [75.708, 31.252], type: 'event' },
  { id: 'new_e5', title: 'Paper Mache workshop', coordinates: [75.70351660899865, 31.25691006152371], type: 'event' },
  { id: 'new_w0', title: 'PYTHON Workshop', coordinates: [75.706, 31.257], type: 'workshop' },
  { id: 'new_w1', title: 'EXCEL Workshop', coordinates: [75.703, 31.254], type: 'workshop' },
  { id: 'new_w2', title: 'FREE FIRE Workshop', coordinates: [75.709, 31.258], type: 'workshop' },

  {
    id: 'e1',
    title: 'HackLPU Registration',
    coordinates: [75.7035, 31.2585],
    type: 'hackathon',
  },
  {
    id: 'e2',
    title: 'RoboWars Arena',
    coordinates: [75.7065, 31.2535],
    type: 'competition',
  },
  {
    id: 'e3',
    title: 'Freshers DJ Night',
    coordinates: [75.7015, 31.2545],
    type: 'social',
  },
];
