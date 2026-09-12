
const crypto = require('crypto');

const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDU0MDUsImV4cCI6MjEwNDcyMTQwNX0.1GsAJG8JWk8qTSZbJWdLwbLisq5wGgIQb6YIgLLOGkE';

async function seedSameerProfile() {
  const email = 'sameersingh@lpu.in';
  
  // Try to find the user first
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users?lpu_email=eq.${email}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  let users = [];
  if (userRes.ok) {
    users = await userRes.json();
  }
  
  let userId;
  if (users.length > 0) {
    userId = users[0].id;
    console.log(`User found: ${userId}`);
  } else {
    // 1. Insert User
    userId = crypto.randomUUID();
    console.log(`User not found. Inserting new user: ${userId}`);
    
    const insertUserRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: userId,
        lpu_email: email,
        firebase_uid: userId, // Mocking firebase_uid
      })
    });
    
    if (!insertUserRes.ok) {
      console.error(`Failed to insert user ${email}:`, await insertUserRes.text());
      return;
    }
  }

  // 2. Insert or Update Profile
  console.log(`Upserting profile for ${userId}...`);
  const profileDetails = {
    id: userId,
    handle: 'saumyatiwari', // from website
    display_name: 'Saumya Tiwari',
    avatar_url: 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png',
    bio: 'Full Stack Dev, AR/VR builder & AI enthusiast. Founder of Elevecrafts. 1st Runner-Up at HackDiwas 3.0.',
    department: 'BCA',
    year: 1,
  };
  
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST', // POST with upsert resolution is typically how we upsert if needed, but let's just use POST with ON CONFLICT DO UPDATE
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(profileDetails)
  });

  if (!profileRes.ok) {
    console.error(`Failed to insert profile for ${email}:`, await profileRes.text());
  } else {
    console.log(`Successfully upserted profile for ${email}.`);
  }
}

seedSameerProfile().catch(console.error);
