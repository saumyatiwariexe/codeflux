"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const supabase_1 = require("../../lib/supabase");
const auth_1 = require("../../lib/auth");
const geo_1 = require("../../lib/geo");
function mapQuest(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        type: row.type,
        xpReward: row.xp_reward,
        badgeId: row.badge_id ?? undefined,
        edurevLinkage: row.edurev_linkage,
        locationRequired: row.location_required,
        targetLocation: row.target_location ?? undefined,
        completionCriteria: row.completion_criteria ?? undefined,
        expiresAt: row.expires_at ?? undefined,
        isActive: row.is_active,
    };
}
const verifySchema = zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() });
const questRoutes = async (fastify) => {
    /** GET /api/v1/quests — active quests, for CampusVerse's Discovery Layer to render as map spawns (AMD-006) */
    fastify.get('/', { preHandler: auth_1.requireAuth }, async (_request, reply) => {
        const { data, error } = await supabase_1.supabase
            .from('quests')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        return reply.send({ success: true, data: (data ?? []).map(mapQuest), error: null });
    });
    /** GET /api/v1/quests/leaderboard */
    fastify.get('/leaderboard', async (_request, reply) => {
        const { data, error } = await supabase_1.supabase
            .from('profiles')
            .select('handle, display_name, campus_xp, level, department')
            .order('campus_xp', { ascending: false })
            .limit(10);
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        const leaderboard = (data ?? []).map((row, i) => ({
            rank: i + 1,
            handle: row.handle,
            displayName: row.display_name,
            campusXp: row.campus_xp,
            level: row.level,
            department: row.department,
        }));
        return reply.send({ success: true, data: leaderboard, error: null });
    });
    /**
     * POST /api/v1/quests/:id/verify — GPS-radius check, awards XP, and (per AMD-007)
     * auto-generates EduRev evidence for edurev_linkage quests instead of requiring manual submission.
     */
    fastify.post('/:id/verify', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const body = verifySchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
        }
        const { data: quest, error: questErr } = await supabase_1.supabase
            .from('quests')
            .select('*')
            .eq('id', request.params.id)
            .maybeSingle();
        if (questErr) {
            fastify.log.error(questErr);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!quest)
            return reply.status(404).send({ success: false, data: null, error: 'Quest not found' });
        if (quest.location_required) {
            const target = quest.target_location;
            if (!target) {
                return reply.status(400).send({ success: false, data: null, error: 'Quest has no target location configured' });
            }
            const dist = (0, geo_1.distanceMeters)({ lat: body.data.lat, lng: body.data.lng }, { lat: target.lat, lng: target.lng });
            if (dist > target.radius_meters) {
                return reply.status(400).send({
                    success: false,
                    data: null,
                    error: `You're ${Math.round(dist)}m away — get within ${target.radius_meters}m to complete this quest.`,
                });
            }
        }
        const { data: progress, error: progressErr } = await supabase_1.supabase
            .from('quest_progress')
            .upsert({
            profile_id: userId,
            quest_id: quest.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
            xp_awarded: quest.xp_reward,
        }, { onConflict: 'profile_id,quest_id' })
            .select('*')
            .single();
        if (progressErr || !progress) {
            fastify.log.error(progressErr);
            return reply.status(500).send({ success: false, data: null, error: 'Failed to record quest completion' });
        }
        const { data: profile } = await supabase_1.supabase.from('profiles').select('campus_xp').eq('id', userId).single();
        if (profile) {
            await supabase_1.supabase.from('profiles').update({ campus_xp: profile.campus_xp + quest.xp_reward }).eq('id', userId);
        }
        // AMD-007: quest completion is the primary data path into EduRev Connect — auto-submit evidence.
        if (quest.edurev_linkage) {
            await supabase_1.supabase.from('edurev_achievements').insert({
                profile_id: userId,
                title: `Quest completed: ${quest.title}`,
                description: quest.description ?? '',
                category: 'MOOC',
                status: 'submitted',
                xp_awarded: quest.xp_reward,
            });
        }
        const result = {
            id: progress.id,
            profileId: progress.profile_id,
            questId: progress.quest_id,
            status: progress.status,
            completedAt: progress.completed_at ?? undefined,
            xpAwarded: progress.xp_awarded ?? undefined,
            quest: mapQuest(quest),
        };
        return reply.send({ success: true, data: result, error: null });
    });
};
exports.default = questRoutes;
//# sourceMappingURL=index.js.map