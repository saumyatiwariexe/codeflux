const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE0NTQwNSwiZXhwIjoyMTA0NzIxNDA1fQ.b3X1h1AQAn_2EnrOIawAniAaaAP43BCzQKib5WAkirU';

async function checkDb() {
  const usersRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id,lpu_email`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const users = await usersRes.json();
  console.log(`Users count: ${users.length}`);

  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,handle,squad_visibility`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const profiles = await profileRes.json();
  console.log(`Profiles count: ${profiles.length}`);

  const swipesRes = await fetch(`${supabaseUrl}/rest/v1/squad_swipes?select=swiper_id,swiped_id`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const swipes = await swipesRes.json();
  console.log(`Swipes count: ${swipes.length}`);
  
  if (swipes.length > 0) {
    // Count swipes per swiper
    const counts = {};
    for (const s of swipes) {
      counts[s.swiper_id] = (counts[s.swiper_id] || 0) + 1;
    }
    console.log('Swipes per user:', counts);
  }
}
checkDb();
