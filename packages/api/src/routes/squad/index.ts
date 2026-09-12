import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse, SwipeDeckCard, SquadMatch, Profile, ProfileSkill, Skill } from '../../../../shared/src/types';
import { calculateMatchScore, getSkillComplementPercent } from '../../services/matching';
import { supabase } from '../../lib/supabase';
import { rankCandidatesWithAI, CandidateWithScore } from '../../services/ai';

const swipeSchema = z.object({
  targetId: z.string(),
  action: z.enum(['like', 'pass', 'super']),
  context: z.enum(['hackathon', 'project', 'general', 'internship']).default('general'),
});

const deckQuerySchema = z.object({
  context: z.string().optional().default('general'),
  limit: z.coerce.number().optional().default(10),
});

/**
 * SquadUp routes: swipe deck, swipe actions, matches, teams
 */
const squadRoutes: FastifyPluginAsync = async (fastify) => {
  // Auth guard helper
  const requireAuth = async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
    }
  };

  /**
   * GET /api/v1/squad/deck
   * Returns a paginated, AI-ranked swipe deck for the current user.
   * Excludes already-swiped profiles.
   */
  fastify.get<{ Querystring: z.infer<typeof deckQuerySchema> }>('/deck', { preHandler: requireAuth }, async (request: any, reply) => {
    const { userId } = request.user as { userId: string }; // This is firebase_uid inside the token 'sub'
    const query = deckQuerySchema.parse(request.query);

    // 1. Get the current user's profile ID
    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', userId)
      .single();

    if (userErr || !userRecord) {
      return reply.status(404).send({ success: false, data: null, error: 'User not found' });
    }

    const currentProfileId = userRecord.id;

    // 2. Fetch current user profile with skills
    const { data: currentProfileData, error: profileErr } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_skills (
          proficiency,
          skills (*)
        )
      `)
      .eq('id', currentProfileId)
      .single();

    if (profileErr || !currentProfileData) {
      return reply.status(404).send({ success: false, data: null, error: 'Profile not found' });
    }

    const currentUser: Profile = mapProfile(currentProfileData);

    // 3. Fetch IDs of profiles we have already swiped on
    const { data: swipes } = await supabase
      .from('squad_swipes')
      .select('swiped_id')
      .eq('swiper_id', currentProfileId);

    const swipedIds = (swipes || []).map(s => s.swiped_id);
    swipedIds.push(currentProfileId); // exclude self

    // 4. Fetch candidates from DB
    // In production, you might want to paginate or filter by specific criteria first to avoid large payload
    const { data: candidateData, error: candidatesErr } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_skills (
          proficiency,
          skills (*)
        )
      `)
      .not('id', 'in', `(${swipedIds.join(',')})`)
      .eq('squad_visibility', 'all') // simple visibility filter
      .limit(50); // Fetch up to 50 for heuristic scoring

    if (candidatesErr || !candidateData) {
      return reply.status(500).send({ success: false, data: null, error: 'Failed to fetch candidates' });
    }

    const candidates: Profile[] = candidateData.map(mapProfile);

    // 5. Heuristic scoring (DB score)
    const heuristicallyScored: CandidateWithScore[] = candidates.map(c => {
      const dbScore = calculateMatchScore(currentUser, c);
      return { ...c, dbScore };
    });

    // Take top 3 heuristically scored for AI ranking to strictly save Gemini tokens
    heuristicallyScored.sort((a, b) => b.dbScore - a.dbScore);
    const topCandidates = heuristicallyScored.slice(0, Math.min(3, query.limit));

    // 6. AI Re-ranking
    const aiRanked = await rankCandidatesWithAI(currentUser, topCandidates, query.context);

    // Format for frontend response
    const deck: SwipeDeckCard[] = aiRanked.slice(0, query.limit).map(c => ({
      ...c,
      matchScore: c.matchScore || c.dbScore,
      skillComplementScore: getSkillComplementPercent(currentUser, c),
      mutualClubs: [], // Placeholder, could join clubs in the future
      matchReason: c.matchReason,
    }));

    return reply.send({ success: true, data: deck, error: null });
  });

  /**
   * POST /api/v1/squad/swipe
   * Records a swipe action and checks for mutual match.
   */
  fastify.post<{ Body: z.infer<typeof swipeSchema> }>('/swipe', { preHandler: requireAuth }, async (request: any, reply) => {
    const body = swipeSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
    }

    const { userId } = request.user as { userId: string };
    const { targetId, action, context } = body.data;

    // Get DB profile ID
    const { data: userRecord } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
    if (!userRecord) return reply.status(404).send({ success: false, data: null, error: 'User not found' });
    
    const swiperId = userRecord.id;

    // 1. Record the swipe
    const { error: swipeErr } = await supabase
      .from('squad_swipes')
      .insert({
        swiper_id: swiperId,
        swiped_id: targetId,
        action,
        context
      });

    if (swipeErr) {
      // Ignore conflict errors (already swiped)
      if (swipeErr.code !== '23505') {
        return reply.status(500).send({ success: false, data: null, error: 'Failed to record swipe' });
      }
    }

    let isMatch = false;

    // 2. Check for mutual match
    if (action !== 'pass') {
      const { data: reciprocalSwipe } = await supabase
        .from('squad_swipes')
        .select('id, action')
        .eq('swiper_id', targetId)
        .eq('swiped_id', swiperId)
        .neq('action', 'pass')
        .single();

      if (reciprocalSwipe) {
        isMatch = true;
        
        // Insert match
        await supabase
          .from('squad_matches')
          .insert({
            user_a: swiperId < targetId ? swiperId : targetId,
            user_b: swiperId < targetId ? targetId : swiperId,
            status: 'matched'
          });
      }
    }

    return reply.send({
      success: true,
      data: { isMatch, action, targetId },
      error: null,
    });
  });

  /**
   * GET /api/v1/squad/matches
   * Returns all mutual matches for the current user.
   */
  fastify.get('/matches', { preHandler: requireAuth }, async (request: any, reply) => {
    const { userId } = request.user as { userId: string };
    
    const { data: userRecord } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
    if (!userRecord) return reply.status(404).send({ success: false, data: null, error: 'User not found' });
    
    const profileId = userRecord.id;

    // Query matches where user is user_a OR user_b
    const { data: matchesData, error: matchErr } = await supabase
      .from('squad_matches')
      .select(`
        id, matched_at, status, team_id,
        user_a, user_b
      `)
      .or(`user_a.eq.${profileId},user_b.eq.${profileId}`);

    if (matchErr || !matchesData) {
      return reply.status(500).send({ success: false, data: null, error: 'Failed to fetch matches' });
    }

    // Now fetch the other profiles
    const otherProfileIds = matchesData.map(m => m.user_a === profileId ? m.user_b : m.user_a);
    
    let profilesMap = new Map<string, Profile>();
    if (otherProfileIds.length > 0) {
      const { data: otherProfilesData } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_skills (
            proficiency,
            skills (*)
          )
        `)
        .in('id', otherProfileIds);
        
      if (otherProfilesData) {
        otherProfilesData.forEach(p => {
          profilesMap.set(p.id, mapProfile(p));
        });
      }
    }

    const formattedMatches: SquadMatch[] = matchesData.map(m => {
      const otherId = m.user_a === profileId ? m.user_b : m.user_a;
      return {
        id: m.id,
        userA: m.user_a,
        userB: m.user_b,
        matchedAt: m.matched_at,
        teamId: m.team_id,
        status: m.status as any,
        otherProfile: profilesMap.get(otherId)
      };
    });

    return reply.send({ success: true, data: formattedMatches, error: null });
  });
};

// Helper function to map DB profile to frontend Profile type
function mapProfile(data: any): Profile {
  return {
    id: data.id,
    handle: data.handle,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    department: data.department,
    year: data.year,
    degreeLevel: data.degree_level,
    stream: data.stream,
    pronouns: data.pronouns,
    hostelBlock: data.hostel_block,
    isDayScholar: data.is_day_scholar,
    campusXp: data.campus_xp,
    level: data.level,
    squadVisibility: data.squad_visibility,
    onboardingComplete: data.onboarding_complete,
    skills: (data.profile_skills || []).map((ps: any) => ({
      skillId: ps.skills.id,
      proficiency: ps.proficiency,
      skill: {
        id: ps.skills.id,
        name: ps.skills.name,
        category: ps.skills.category,
        icon: ps.skills.icon,
      } as Skill
    })),
  };
}

export default squadRoutes;
