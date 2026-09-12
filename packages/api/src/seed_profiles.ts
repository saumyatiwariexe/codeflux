const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase } = require('./lib/supabase');


const MOCK_AVATARS = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/85.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/46.jpg',
  'https://randomuser.me/api/portraits/women/93.jpg',
];

const DEPARTMENTS = ['CSE', 'BCA', 'BBA', 'B.Tech', 'MBA'];

async function seedProfiles() {
  console.log('Fetching all users...');
  const { data: users, error: usersErr } = await supabase.from('users').select('*');
  
  if (usersErr) {
    console.error('Error fetching users:', usersErr);
    return;
  }
  
  console.log(`Found ${users.length} users.`);
  
  const profiles = users.map((u: any, i: number) => {
    // Generate a simple name based on the email part before @
    const namePart = u.lpu_email.split('@')[0].replace(/[0-9]/g, '');
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    return {
      id: u.id,
      handle: u.lpu_email.split('@')[0],
      display_name: displayName,
      avatar_url: MOCK_AVATARS[i % MOCK_AVATARS.length],
      bio: `Student at LPU. Exploring Campus Pulse!`,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      year: (i % 4) + 1,
      campus_xp: Math.floor(Math.random() * 5000),
      level: Math.floor(Math.random() * 5) + 1,
      squad_visibility: 'all'
    };
  });
  
  console.log('Upserting profiles...');
  const { data, error } = await supabase.from('profiles').upsert(profiles);
  
  if (error) {
    console.error('Failed to seed profiles:', error);
  } else {
    console.log(`Successfully seeded ${profiles.length} profiles!`);
  }
}

seedProfiles();
