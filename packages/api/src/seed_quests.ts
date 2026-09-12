const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase } = require('./lib/supabase');
const crypto = require('crypto');

const questsToSeed = [
  {
    id: crypto.randomUUID(),
    title: 'The Library Lurker',
    description: 'Spend 30 minutes in the Central Library reading zone.',
    type: 'academic',
    xp_reward: 150,
    location_required: true,
    target_location: { coordinates: [75.7042, 31.2572] },
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    title: 'Campus Cartographer',
    description: 'Discover the Tech Block, Admin Building, and Sports Complex.',
    type: 'explorer',
    xp_reward: 300,
    location_required: true,
    target_location: { coordinates: [75.7058, 31.2565] },
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    title: 'Food Court Champion',
    description: 'Try 3 different stalls at the main Food Court.',
    type: 'social',
    xp_reward: 100,
    location_required: true,
    target_location: { coordinates: [75.7028, 31.2548] },
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    title: 'Robo Watcher',
    description: 'Attend the RoboWars arena event and cheer a team.',
    type: 'social',
    xp_reward: 200,
    location_required: true,
    target_location: { coordinates: [75.7068, 31.2538] },
    is_active: true
  }
];

async function seedQuests() {
  console.log('Seeding quests...');
  const { data, error } = await supabase.from('quests').upsert(questsToSeed);
  if (error) {
    console.error('Failed to seed quests:', error);
  } else {
    console.log('Successfully seeded quests:', questsToSeed.length);
  }
  
  const { data: qData } = await supabase.from('quests').select('*');
  console.log('Total Quests in DB:', qData.length);
}

seedQuests();
