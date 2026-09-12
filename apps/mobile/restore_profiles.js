const fs = require('fs');
try {
  const profiles = JSON.parse(fs.readFileSync('C:/retry/codeflux/jason data/gemini-code-1789206570965.json'));
  let profStr = '';
  profiles.forEach((p, i) => {
    profStr += `  {
      id: 'new_p${i}',
      displayName: '${p.name.replace(/'/g, "\\'")}',
      avatarUrl: { uri: '${p.imageUrl}' },
      handle: '${p.name.toLowerCase()}_${i}',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [],
      prompts: []
    },\n`;
  });

  let squadup = fs.readFileSync('C:/retry/codeflux/apps/mobile/app/(tabs)/squadup.tsx', 'utf8');
  squadup = squadup.replace('const MOCK_DECK: SwipeCardData[] = [', 'const MOCK_DECK: SwipeCardData[] = [\n' + profStr);
  fs.writeFileSync('C:/retry/codeflux/apps/mobile/app/(tabs)/squadup.tsx', squadup);
  console.log('Restored mock profiles.');
} catch (e) {
  console.error(e);
}
