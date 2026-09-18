// Approximate coordinates for Lovely Professional University (LPU)
export const LPU_CENTER = [75.7051, 31.2560];

// Fog of War will be generated dynamically using turf.js or manual GeoJSON arrays in MapCanvas

// Mock Events for Pins
export const LIVE_EVENTS = [
  { id: 'new_e0', title: 'WEB-A-THON 2.0 | LPU\u2019s Next Big Hackathon', coordinates: [75.70418188756499, 31.25780198350727], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/web-a-thon-20--lpus-next-big-hackathon-6aa2c8e7f28decc1178eb634-1789162899017.png' },
  { id: 'new_e1', title: 'Code Heist Hackathon', coordinates: [75.70403943144836, 31.25752908810706], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk4NjdlYjdmMTA4MzUwN2ZiOGRjZjkvMTc4ODUyODAxMzE3Ml82NjYyNDE0ZjcwOWU4NGZjMTI5YWFhZTVmZWU2MGI1MC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19' },
  { id: 'new_e2', title: 'Code2Career AI Hackathon', coordinates: [75.70520968892794, 31.257884891805208], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2NvZGUyY2FyZWVyLWFpLWhhY2thdGhvbi0xNzg4NzgzODY5ODQ4LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0=' },
  { id: 'new_e3', title: 'Anime Night 2.0', coordinates: [75.702, 31.259], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTlmZWJhY2ZlN2VlYThhYzZhMDU1ZWEvMTc4OTExMDY4MDMxN18wNjAzNWRiYzk2OTA0NDEyNmQzYjI3ZTk5OWVlOTUyZS5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19' },
  { id: 'new_e4', title: 'GOAL RUSH', coordinates: [75.708, 31.252], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2dvbGQtcnVzaC0xNzg3OTk1MzE1OTA1LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0=' },
  { id: 'new_e5', title: 'Paper Mache workshop', coordinates: [75.70351660899865, 31.25691006152371], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/paper-mache-workshop-6a9fb8135d8f22c034998d3a-1789050928527.jpg' },
  { id: 'new_e6', title: 'International coneference', coordinates: [75.705, 31.255], type: 'event', posterUrl: 'https://onlytemptestingmacbease.s3.ap-south-1.amazonaws.com/public/event/6aa294ddf28decc1178e8c34/1789051516809_3fe46f88df53a3af1dbbf54ea9d469c4.png' },
  { id: 'new_e7', title: 'Nepal flood relief collection drive', coordinates: [75.704, 31.258], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk0MTU1MzdmMTA4MzUwN2ZiNzBmNzMvcG9zdGVyXzE3ODgwOTE0NjA3OTBfbmVwYWwtMTZfOS1jbGVhbi5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19' },
  { id: 'new_e8', title: 'Warzone3', coordinates: [75.7085, 31.2525], type: 'event', posterUrl: 'https://onlytemptestingmacbease.s3.ap-south-1.amazonaws.com/public/club/event/warzone3-1789137532269.jpg' },
  { id: 'new_e9', title: 'lights out', coordinates: [75.703, 31.251], type: 'event', posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/lights-out-6a8a8b80ab033ae5a7011699-1788167034184.png' },
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

// ---- Map Quest Pins ----
export type QuestType = 'explorer' | 'academic' | 'social' | 'challenge' | 'daily';

export interface MapQuest {
  id: string;
  title: string;
  description: string;
  coordinates: [number, number];
  xp: number;
  type: QuestType;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  timeLimit?: string; // e.g. "2h left"
}

export const MAP_QUESTS: MapQuest[] = [
  {
    id: 'mq1',
    title: 'The Library Lurker',
    description: 'Spend 30 minutes in the Central Library reading zone.',
    coordinates: [75.7042, 31.2572],
    xp: 150,
    type: 'academic',
    difficulty: 'easy',
    completed: false,
    timeLimit: '4h left',
  },
  {
    id: 'mq2',
    title: 'Campus Cartographer',
    description: 'Discover the Tech Block, Admin Building, and Sports Complex.',
    coordinates: [75.7058, 31.2565],
    xp: 300,
    type: 'explorer',
    difficulty: 'medium',
    completed: false,
    timeLimit: '1d left',
  },
  {
    id: 'mq3',
    title: 'Food Court Champion',
    description: 'Try 3 different stalls at the main Food Court.',
    coordinates: [75.7028, 31.2548],
    xp: 100,
    type: 'social',
    difficulty: 'easy',
    completed: false,
  },
  {
    id: 'mq4',
    title: 'Robo Watcher',
    description: 'Attend the RoboWars arena event and cheer a team.',
    coordinates: [75.7068, 31.2538],
    xp: 200,
    type: 'social',
    difficulty: 'easy',
    completed: false,
    timeLimit: '2h left',
  },
  {
    id: 'mq5',
    title: 'Midnight Coder',
    description: 'Submit a project to the HackLPU hackathon.',
    coordinates: [75.7038, 31.2582],
    xp: 500,
    type: 'challenge',
    difficulty: 'hard',
    completed: false,
    timeLimit: '6h left',
  },
  {
    id: 'mq6',
    title: 'Hostel Hero',
    description: 'Help a fellow student carry luggage on move-in day.',
    coordinates: [75.7075, 31.2555],
    xp: 120,
    type: 'social',
    difficulty: 'easy',
    completed: true,
  },
  {
    id: 'mq7',
    title: 'Daily Grind: Morning Run',
    description: 'Complete a lap around the Sports Track before 8 AM.',
    coordinates: [75.7015, 31.2532],
    xp: 75,
    type: 'daily',
    difficulty: 'easy',
    completed: false,
    timeLimit: '3h left',
  },
  {
    id: 'mq8',
    title: 'SquadUp Starter',
    description: 'Match with 2 students via SquadUp and say hello.',
    coordinates: [75.7050, 31.2590],
    xp: 250,
    type: 'challenge',
    difficulty: 'medium',
    completed: false,
  },
];
