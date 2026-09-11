import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse, SwipeDeckCard, SquadMatch, SwipeAction } from '../../../../shared/src/types';
import { MOCK_PROFILES } from '../users/mock-data';
import { calculateMatchScore } from '../../services/matching';

const swipeSchema = z.object({
  targetId: z.string(),
  action: z.enum(['like', 'pass', 'super']),
  context: z.enum(['hackathon', 'project', 'general', 'internship']).default('general'),
});

// In-memory swipe storage for hackathon demo
const swipeStore = new Map<string, { targetId: string; action: SwipeAction }[]>();
const matchStore = new Map<string, SquadMatch[]>();

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
  fastify.get('/deck', { preHandler: requireAuth }, async (request: any, reply) => {
    const { userId } = request.user as { userId: string };
    const alreadySwiped = (swipeStore.get(userId) ?? []).map((s) => s.targetId);

    const currentUser = MOCK_PROFILES.find((p) => p.id === userId) ?? MOCK_PROFILES[0];
    
    const deck: SwipeDeckCard[] = MOCK_PROFILES
      .filter((p) => p.id !== userId && !alreadySwiped.includes(p.id))
      .slice(0, 10)
      .map((profile) => ({
        ...profile,
        matchScore: calculateMatchScore(currentUser, profile),
        skillComplementScore: 80,
        mutualClubs: ['ACM-LPU', 'ISTE'],
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return reply.send({ success: true, data: deck, error: null } satisfies ApiResponse<SwipeDeckCard[]>);
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

    // Record the swipe
    const userSwipes = swipeStore.get(userId) ?? [];
    userSwipes.push({ targetId, action });
    swipeStore.set(userId, userSwipes);

    // Check for mutual match (if action is 'like' or 'super')
    let isMatch = false;
    if (action !== 'pass') {
      const targetSwipes = swipeStore.get(targetId) ?? [];
      const theyLikedUs = targetSwipes.some(
        (s) => s.targetId === userId && s.action !== 'pass'
      );

      if (theyLikedUs) {
        isMatch = true;
        const matchId = `match_${[userId, targetId].sort().join('_')}`;
        const match: SquadMatch = {
          id: matchId,
          userA: userId,
          userB: targetId,
          matchedAt: new Date().toISOString(),
          status: 'matched',
        };
        const userMatches = matchStore.get(userId) ?? [];
        userMatches.push(match);
        matchStore.set(userId, userMatches);
      }
    }

    return reply.send({
      success: true,
      data: { isMatch, action, targetId },
      error: null,
    } satisfies ApiResponse<{ isMatch: boolean; action: string; targetId: string }>);
  });

  /**
   * GET /api/v1/squad/matches
   * Returns all mutual matches for the current user.
   */
  fastify.get('/matches', { preHandler: requireAuth }, async (request: any, reply) => {
    const { userId } = request.user as { userId: string };
    const matches = matchStore.get(userId) ?? MOCK_MATCHES;

    return reply.send({ success: true, data: matches, error: null } satisfies ApiResponse<SquadMatch[]>);
  });
};

// ---- Mock matches for demo ----
const MOCK_MATCHES: SquadMatch[] = [
  {
    id: 'match_001',
    userA: 'demo_user',
    userB: 'profile_aarav',
    matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'matched',
    otherProfile: {
      id: 'profile_aarav',
      handle: 'aarav_sharma',
      displayName: 'Aarav Sharma',
      avatarUrl: undefined,
      department: 'CSE',
      year: 3,
      degreeLevel: 'UG',
      isDayScholar: true,
      campusXp: 8400,
      level: 5,
      squadVisibility: 'all',
      onboardingComplete: true,
      bio: 'Next.js 14, PyTorch, Supabase & Tailwind. Building blazing-fast LLM wrappers.',
      skills: [
        { skillId: 's1', skill: { id: 's1', name: 'React', category: 'Tech' }, proficiency: 'expert' },
        { skillId: 's2', skill: { id: 's2', name: 'Computer Vision', category: 'Tech' }, proficiency: 'intermediate' },
      ],
    },
  },
  {
    id: 'match_002',
    userA: 'demo_user',
    userB: 'profile_priya',
    matchedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'matched',
    otherProfile: {
      id: 'profile_priya',
      handle: 'priya_design',
      displayName: 'Priya Krishnan',
      avatarUrl: undefined,
      department: 'Design',
      year: 2,
      degreeLevel: 'UG',
      isDayScholar: false,
      campusXp: 5200,
      level: 4,
      squadVisibility: 'all',
      onboardingComplete: true,
      bio: 'UI/UX designer. Figma wizard. Design systems enthusiast.',
      skills: [
        { skillId: 's3', skill: { id: 's3', name: 'Figma', category: 'Design' }, proficiency: 'expert' },
        { skillId: 's4', skill: { id: 's4', name: 'Branding', category: 'Design' }, proficiency: 'expert' },
      ],
    },
  },
];

export default squadRoutes;
