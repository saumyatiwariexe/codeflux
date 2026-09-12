import { GoogleGenAI } from '@google/genai';
import { Profile } from '../../../shared/src/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export interface CandidateWithScore extends Profile {
  aiScore?: number;
  dbScore: number;
  matchScore?: number;
  matchReason?: string;
}

// Very strict rate limiting for Gemini to save tokens
const MAX_CALLS_PER_HOUR = 30;
let geminiCallCount = 0;
let lastReset = Date.now();

/**
 * Re-ranks candidates based on bio synergy using Gemini LLM.
 */
export async function rankCandidatesWithAI(
  currentUser: Profile,
  candidates: CandidateWithScore[],
  context: string = 'general'
): Promise<CandidateWithScore[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ No GEMINI_API_KEY set. Falling back to DB heuristic scoring.');
    return candidates.sort((a, b) => b.dbScore - a.dbScore);
  }

  if (candidates.length === 0) return [];

  // Reset counter every hour
  if (Date.now() - lastReset > 3600 * 1000) {
    geminiCallCount = 0;
    lastReset = Date.now();
  }

  if (geminiCallCount >= MAX_CALLS_PER_HOUR) {
    console.warn('⚠️ Gemini rate limit exceeded. Falling back to DB heuristic scoring.');
    return candidates.sort((a, b) => b.dbScore - a.dbScore);
  }

  geminiCallCount++;

  // Simplify profiles to save tokens
  const simpleCurrentUser = {
    handle: currentUser.handle,
    bio: currentUser.bio,
    department: currentUser.department,
    skills: currentUser.skills?.map(s => `${s.skill.name} (${s.proficiency})`),
  };

  const simpleCandidates = candidates.map(c => ({
    id: c.id,
    handle: c.handle,
    bio: c.bio,
    department: c.department,
    skills: c.skills?.map(s => `${s.skill.name} (${s.proficiency})`),
  }));

  const prompt = `
You are an expert matchmaking AI for a university networking app called SquadUp.
Your goal is to evaluate how well each candidate complements the current user for a team formation scenario.

Current User:
${JSON.stringify(simpleCurrentUser, null, 2)}

Context of the search: ${context}

Candidates:
${JSON.stringify(simpleCandidates, null, 2)}

Task:
Score each candidate from 0 to 100 based on how complementary their skills, department, and bio are to the current user, keeping the context in mind.
Provide a 'reason' (max 2 sentences) explaining WHY they are a good match. Speak directly to the user (e.g. "Their frontend skills complement your backend...").
Return ONLY a valid JSON array of objects with 'id', 'score', and 'reason' properties. Do not include any markdown formatting like \`\`\`json.
Example: [{"id": "uuid-1", "score": 85, "reason": "Their frontend skills complement your backend expertise."}, {"id": "uuid-2", "score": 40, "reason": "Similar skillsets might lead to overlap."}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 1024,
        temperature: 0.1,
      }
    });

    // Remove any potential markdown wrapping (e.g. ```json ... ```)
    let responseText = response.text || '[]';
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const scores: { id: string; score: number; reason: string }[] = JSON.parse(responseText);

    const scoreMap = new Map<string, { score: number; reason: string }>();
    for (const s of scores) {
      scoreMap.set(s.id, { score: s.score, reason: s.reason });
    }

    // Apply the AI score and calculate final score (e.g., 50% DB, 50% AI)
    return candidates.map(c => {
      const aiData = scoreMap.get(c.id);
      const aiScore = aiData?.score || 0;
      const matchReason = aiData?.reason;
      return {
        ...c,
        aiScore,
        matchReason,
        matchScore: Math.round((c.dbScore + aiScore) / 2),
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  } catch (err) {
    console.error('Error during AI ranking:', err);
    // Fallback to dbScore
    return candidates.sort((a, b) => b.dbScore - a.dbScore);
  }
}
