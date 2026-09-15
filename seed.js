const fs = require('fs');
const crypto = require('crypto');

const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDU0MDUsImV4cCI6MjEwNDcyMTQwNX0.1GsAJG8JWk8qTSZbJWdLwbLisq5wGgIQb6YIgLLOGkE';

const profilesData = JSON.parse(fs.readFileSync('c:/retry/codeflux/jason data/gemini-code-1789206570965.json', 'utf8'));

async function seedData() {
  for (const profile of profilesData) {
    const uuid = crypto.randomUUID();
    const email = `${profile.name.toLowerCase()}${profile.id}@lpu.in`;

    // 1. Insert User
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: uuid,
        lpu_email: email,
        firebase_uid: uuid,
      })
    });

    if (!userRes.ok) {
      console.error(`Failed to insert user ${email}:`, await userRes.text());
      continue;
    }

    // 2. Insert Profile
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: uuid,
        handle: `${profile.name.toLowerCase()}_${profile.id}`,
        display_name: profile.name,
        avatar_url: profile.imageUrl,
        bio: `Hi, I am ${profile.name}! Ready to explore CampusPulse.`,
        department: 'B.Tech CSE',
        year: 2,
      })
    });

    if (!profileRes.ok) {
      console.error(`Failed to insert profile for ${email}:`, await profileRes.text());
    } else {
      console.log(`Successfully inserted profile for ${profile.name}`);
    }
  }
}

seedData().then(() => console.log('Done seeding profiles.'));
