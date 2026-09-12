

const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE0NTQwNSwiZXhwIjoyMTA0NzIxNDA1fQ.b3X1h1AQAn_2EnrOIawAniAaaAP43BCzQKib5WAkirU';

async function updateProfile() {
  console.log('Fetching user with email containing sameersingh...');
  
  // Try to find the user
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users?lpu_email=ilike.*sameersingh*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  const users = await userRes.json();
  if (!userRes.ok || users.length === 0) {
    console.error('Failed to find user with email sameersingh', users);
    return;
  }
  
  const user = users[0];
  console.log(`Found user: ${user.lpu_email} with ID: ${user.id}`);
  
  const profileDetails = {
    handle: 'sameer_1',
    display_name: 'Saumya Tiwari',
    avatar_url: 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png',
    bio: 'Full Stack Dev, AR/VR builder & AI enthusiast. Founder of Elevecrafts. 1st Runner-Up at HackDiwas 3.0.',
    department: 'BCA',
    year: 1,
    level: 6,
    campus_xp: 9500
  };
  
  console.log('Updating profile...');
  
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(profileDetails)
  });
  
  const updatedProfile = await profileRes.json();
  if (!profileRes.ok) {
    console.error('Failed to update profile:', updatedProfile);
  } else {
    console.log('Successfully updated profile:', updatedProfile);
  }
}

updateProfile().catch(console.error);
