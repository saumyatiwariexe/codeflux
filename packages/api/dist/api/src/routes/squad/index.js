"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const matching_1 = require("../../services/matching");
const supabase_1 = require("../../lib/supabase");
const auth_1 = require("../../lib/auth");
const mappers_1 = require("../../lib/mappers");
const swipeSchema = zod_1.z.object({
    targetId: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['like', 'pass', 'super']),
    context: zod_1.z.enum(['hackathon', 'project', 'general', 'internship']).default('general'),
});
/**
 * SquadUp routes: swipe deck, swipe actions, matches, teams
 */
const squadRoutes = async (fastify) => {
    /**
     * GET /api/v1/squad/deck
     * Real, AI-free (heuristic) ranked deck: excludes self and anyone already swiped on.
     */
    fastify.get('/deck', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const [{ data: me, error: meErr }, { data: swiped, error: swipedErr }] = await Promise.all([
            supabase_1.supabase.from('profiles').select(mappers_1.PROFILE_SELECT_WITH_JOINS).eq('id', userId).maybeSingle(),
            supabase_1.supabase.from('squad_swipes').select('swiped_id').eq('swiper_id', userId),
        ]);
        if (meErr || swipedErr) {
            fastify.log.error(meErr ?? swipedErr);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!me) {
            return reply.status(400).send({ success: false, data: null, error: 'Complete your profile before using SquadUp' });
        }
        const excludeIds = [userId, ...(swiped ?? []).map((s) => s.swiped_id)];
        const { data: candidates, error: candErr } = await supabase_1.supabase
            .from('profiles')
            .select(mappers_1.PROFILE_SELECT_WITH_JOINS)
            .not('id', 'in', `(${excludeIds.join(',')})`)
            .eq('onboarding_complete', true)
            .limit(20);
        if (candErr) {
            fastify.log.error(candErr);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        const currentProfile = (0, mappers_1.mapProfileRow)(me);
        const deck = (candidates ?? [])
            .map(mappers_1.mapProfileRow)
            .map((profile) => ({
            ...profile,
            matchScore: (0, matching_1.calculateMatchScore)(currentProfile, profile),
            skillComplementScore: (0, matching_1.getSkillComplementPercent)(currentProfile, profile),
            mutualClubs: [],
        }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);
        return reply.send({ success: true, data: deck, error: null });
    });
    /**
     * POST /api/v1/squad/swipe
     * Records a swipe and creates a squad_match row on mutual like.
     */
    fastify.post('/swipe', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const body = swipeSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
        }
        const { userId } = request.user;
        const { targetId, action, context } = body.data;
        const { error: insertErr } = await supabase_1.supabase
            .from('squad_swipes')
            .upsert({ swiper_id: userId, swiped_id: targetId, action, context }, { onConflict: 'swiper_id,swiped_id' });
        if (insertErr) {
            fastify.log.error(insertErr);
            return reply.status(500).send({ success: false, data: null, error: 'Failed to record swipe' });
        }
        let isMatch = false;
        if (action !== 'pass') {
            const { data: reciprocal } = await supabase_1.supabase
                .from('squad_swipes')
                .select('action')
                .eq('swiper_id', targetId)
                .eq('swiped_id', userId)
                .neq('action', 'pass')
                .maybeSingle();
            if (reciprocal) {
                isMatch = true;
                const [userA, userB] = [userId, targetId].sort();
                const { error: matchErr } = await supabase_1.supabase
                    .from('squad_matches')
                    .upsert({ user_a: userA, user_b: userB, status: 'matched' }, { onConflict: 'user_a,user_b' });
                if (matchErr)
                    fastify.log.error(matchErr);
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
     */
    fastify.get('/matches', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const { data, error } = await supabase_1.supabase
            .from('squad_matches')
            .select(`*, profileA:profiles!squad_matches_user_a_fkey(${mappers_1.PROFILE_SELECT_WITH_JOINS}), profileB:profiles!squad_matches_user_b_fkey(${mappers_1.PROFILE_SELECT_WITH_JOINS})`)
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .order('matched_at', { ascending: false });
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        const matches = (data ?? []).map((row) => {
            const otherRow = row.user_a === userId ? row.profileB : row.profileA;
            return {
                id: row.id,
                userA: row.user_a,
                userB: row.user_b,
                matchedAt: row.matched_at,
                teamId: row.team_id ?? undefined,
                status: row.status,
                otherProfile: otherRow ? (0, mappers_1.mapProfileRow)(otherRow) : undefined,
            };
        });
        return reply.send({ success: true, data: matches, error: null });
    });
};
exports.default = squadRoutes;
//# sourceMappingURL=index.js.map