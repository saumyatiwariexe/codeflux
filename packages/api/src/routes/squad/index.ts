import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse, SwipeDeckCard, SquadMatch } from '../../../../shared/src/types';
import { calculateMatchScore, getSkillComplementPercent } from '../../services/matching';
import { supabase } from '../../lib/supabase';
import { requireAuth, JwtPayload } from '../../lib/auth';
import { mapProfileRow, PROFILE_SELECT_WITH_JOINS } from '../../lib/mappers';

const swipeSchema = z.object({
  targetId: z.string().uuid(),
  action: z.enum(['like', 'pass', 'super']),
  context: z.enum(['hackathon', 'project', 'general', 'internship']).default('general'),
});

/**
 * SquadUp routes: swipe deck, swipe actions, matches, teams
 */
const squadRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/squad/deck
   * Real, AI-free (heuristic) ranked deck: excludes self and anyone already swiped on.
   */
  fastify.get('/deck', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;

    const [{ data: me, error: meErr }, { data: swiped, error: swipedErr }] = await Promise.all([
      supabase.from('profiles').select(PROFILE_SELECT_WITH_JOINS).eq('id', userId).maybeSingle(),
      supabase.from('squad_swipes').select('swiped_id').eq('swiper_id', userId),
    ]);

    if (meErr || swipedErr) {
      fastify.log.error(meErr ?? swipedErr);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }
    if (!me) {
      return reply.status(400).send({ success: false, data: null, error: 'Complete your profile before using SquadUp' });
    }

    const excludeIds = [userId, ...(swiped ?? []).map((s) => s.swiped_id)];

    const { data: candidates, error: candErr } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_WITH_JOINS)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .eq('onboarding_complete', true)
      .limit(20);

    if (candErr) {
      fastify.log.error(candErr);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }

    const currentProfile = mapProfileRow(me);
    const deck: SwipeDeckCard[] = (candidates ?? [])
      .map(mapProfileRow)
      .map((profile) => ({
        ...profile,
        matchScore: calculateMatchScore(currentProfile, profile),
        skillComplementScore: getSkillComplementPercent(currentProfile, profile),
        mutualClubs: [],
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return reply.send({ success: true, data: deck, error: null } satisfies ApiResponse<SwipeDeckCard[]>);
  });

  /**
   * POST /api/v1/squad/swipe
   * Records a swipe and creates a squad_match row on mutual like.
   */
  fastify.post<{ Body: z.infer<typeof swipeSchema> }>('/swipe', { preHandler: requireAuth }, async (request, reply) => {
    const body = swipeSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
    }

    const { userId } = request.user as JwtPayload;
    const { targetId, action, context } = body.data;

    const { error: insertErr } = await supabase
      .from('squad_swipes')
      .upsert({ swiper_id: userId, swiped_id: targetId, action, context }, { onConflict: 'swiper_id,swiped_id' });

    if (insertErr) {
      fastify.log.error(insertErr);
      return reply.status(500).send({ success: false, data: null, error: 'Failed to record swipe' });
    }

    let isMatch = false;
    if (action !== 'pass') {
      const { data: reciprocal } = await supabase
        .from('squad_swipes')
        .select('action')
        .eq('swiper_id', targetId)
        .eq('swiped_id', userId)
        .neq('action', 'pass')
        .maybeSingle();

      if (reciprocal) {
        isMatch = true;
        const [userA, userB] = [userId, targetId].sort();
        const { error: matchErr } = await supabase
          .from('squad_matches')
          .upsert({ user_a: userA, user_b: userB, status: 'matched' }, { onConflict: 'user_a,user_b' });
        if (matchErr) fastify.log.error(matchErr);
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
   */
  fastify.get('/matches', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;

    const { data, error } = await supabase
      .from('squad_matches')
      .select(`*, profileA:profiles!squad_matches_user_a_fkey(${PROFILE_SELECT_WITH_JOINS}), profileB:profiles!squad_matches_user_b_fkey(${PROFILE_SELECT_WITH_JOINS})`)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('matched_at', { ascending: false });

    if (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }

    const matches: SquadMatch[] = (data ?? []).map((row: any) => {
      const otherRow = row.user_a === userId ? row.profileB : row.profileA;
      return {
        id: row.id,
        userA: row.user_a,
        userB: row.user_b,
        matchedAt: row.matched_at,
        teamId: row.team_id ?? undefined,
        status: row.status,
        otherProfile: otherRow ? mapProfileRow(otherRow) : undefined,
      };
    });

    return reply.send({ success: true, data: matches, error: null } satisfies ApiResponse<SquadMatch[]>);
  });
};

export default squadRoutes;
