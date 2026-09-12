const supabaseUrl = 'https://fassxdmpwjctodjusjdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3N4ZG1wd2pjdG9kanVzamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDU0MDUsImV4cCI6MjEwNDcyMTQwNX0.1GsAJG8JWk8qTSZbJWdLwbLisq5wGgIQb6YIgLLOGkE';

async function fetchUsers() {
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const users = await userRes.json();
  console.log(users.map(u => u.lpu_email));
}

fetchUsers().catch(console.error);
