

const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDU0MDUsImV4cCI6MjEwNDcyMTQwNX0.1GsAJG8JWk8qTSZbJWdLwbLisq5wGgIQb6YIgLLOGkE';

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
    display_name: 'Saumya Tiwari',
    avatar_url: 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png',
    bio: 'Full Stack Dev, AR/VR builder & AI enthusiast. Founder of Elevecrafts. 1st Runner-Up at HackDiwas 3.0.',
    department: 'BCA',
    year: 1,
    skills: JSON.stringify([
      { skill: { name: 'Next.js' }, proficiency: 'expert' },
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Python', icon: 'language-python' }, proficiency: 'expert' },
      { skill: { name: 'WebXR' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' }
    ])
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
