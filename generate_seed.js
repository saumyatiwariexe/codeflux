const fs = require('fs');
const crypto = require('crypto');

const profilesData = JSON.parse(fs.readFileSync('c:/retry/codeflux/jason data/gemini-code-1789206570965.json', 'utf8'));

let sql = '';

for (const profile of profilesData) {
  const uuid = crypto.randomUUID();
  const email = `${profile.name.toLowerCase()}${profile.id}@lpu.in`;
  const handle = `${profile.name.toLowerCase()}_${profile.id}`;

  sql += `INSERT INTO users (id, lpu_email, firebase_uid) VALUES ('${uuid}', '${email}', '${uuid}');\n`;
  sql += `INSERT INTO profiles (id, handle, display_name, avatar_url, bio, department, year) VALUES ('${uuid}', '${handle}', '${profile.name}', '${profile.imageUrl}', 'Hi, I am ${profile.name}! Ready to explore CampusPulse.', 'B.Tech CSE', 2);\n`;
}

fs.writeFileSync('c:/retry/codeflux/seed.sql', sql);
console.log('Generated seed.sql');
