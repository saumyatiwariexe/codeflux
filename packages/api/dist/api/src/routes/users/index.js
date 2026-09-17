"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const supabase_1 = require("../../lib/supabase");
const auth_1 = require("../../lib/auth");
const mappers_1 = require("../../lib/mappers");
const updateProfileSchema = zod_1.z.object({
    handle: zod_1.z.string().regex(/^[a-z0-9_]{3,30}$/).optional(),
    displayName: zod_1.z.string().min(1).max(80).optional(),
    bio: zod_1.z.string().max(300).optional(),
    department: zod_1.z.string().optional(),
    year: zod_1.z.number().int().min(1).max(6).optional(),
    degreeLevel: zod_1.z.enum(['UG', 'PG', 'PhD']).optional(),
    stream: zod_1.z.string().optional(),
    pronouns: zod_1.z.string().optional(),
    hostelBlock: zod_1.z.string().optional(),
    isDayScholar: zod_1.z.boolean().optional(),
    squadVisibility: zod_1.z.enum(['all', 'dept', 'off']).optional(),
    onboardingComplete: zod_1.z.boolean().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    skillIds: zod_1.z.array(zod_1.z.object({ skillId: zod_1.z.string(), proficiency: zod_1.z.enum(['beginner', 'intermediate', 'expert']) })).optional(),
});
const userRoutes = async (fastify) => {
    /** GET /api/v1/users/me */
    fastify.get('/me', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const { data, error } = await supabase_1.supabase
            .from('profiles')
            .select(mappers_1.PROFILE_SELECT_WITH_JOINS)
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!data) {
            // Profile not created yet — onboarding not started.
            return reply.send({
                success: true,
                data: { id: userId, onboardingComplete: false },
                error: null,
            });
        }
        return reply.send({ success: true, data: (0, mappers_1.mapProfileRow)(data), error: null });
    });
    /**
     * PATCH /api/v1/users/me — create-or-update profile (upsert).
     * Doubles as the onboarding endpoint: the first call with `handle` + `displayName`
     * creates the row (profiles.id references users.id 1:1).
     */
    fastify.patch('/me', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const body = updateProfileSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
        }
        const { skillIds, ...profileFields } = body.data;
        const columnMap = {
            id: userId,
            ...(profileFields.handle !== undefined && { handle: profileFields.handle }),
            ...(profileFields.displayName !== undefined && { display_name: profileFields.displayName }),
            ...(profileFields.bio !== undefined && { bio: profileFields.bio }),
            ...(profileFields.department !== undefined && { department: profileFields.department }),
            ...(profileFields.year !== undefined && { year: profileFields.year }),
            ...(profileFields.degreeLevel !== undefined && { degree_level: profileFields.degreeLevel }),
            ...(profileFields.stream !== undefined && { stream: profileFields.stream }),
            ...(profileFields.pronouns !== undefined && { pronouns: profileFields.pronouns }),
            ...(profileFields.hostelBlock !== undefined && { hostel_block: profileFields.hostelBlock }),
            ...(profileFields.isDayScholar !== undefined && { is_day_scholar: profileFields.isDayScholar }),
            ...(profileFields.squadVisibility !== undefined && { squad_visibility: profileFields.squadVisibility }),
            ...(profileFields.onboardingComplete !== undefined && { onboarding_complete: profileFields.onboardingComplete }),
            ...(profileFields.avatarUrl !== undefined && { avatar_url: profileFields.avatarUrl }),
            updated_at: new Date().toISOString(),
        };
        const { data: upserted, error } = await supabase_1.supabase
            .from('profiles')
            .upsert(columnMap, { onConflict: 'id' })
            .select(mappers_1.PROFILE_SELECT_WITH_JOINS)
            .single();
        if (error || !upserted) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: error?.message ?? 'Failed to save profile' });
        }
        if (skillIds) {
            await supabase_1.supabase.from('profile_skills').delete().eq('profile_id', userId);
            if (skillIds.length > 0) {
                await supabase_1.supabase.from('profile_skills').insert(skillIds.map((s) => ({ profile_id: userId, skill_id: s.skillId, proficiency: s.proficiency })));
            }
            const { data: refreshed } = await supabase_1.supabase
                .from('profiles')
                .select(mappers_1.PROFILE_SELECT_WITH_JOINS)
                .eq('id', userId)
                .single();
            return reply.send({ success: true, data: (0, mappers_1.mapProfileRow)(refreshed), error: null });
        }
        return reply.send({ success: true, data: (0, mappers_1.mapProfileRow)(upserted), error: null });
    });
    /** GET /api/v1/users/:handle — public profile */
    fastify.get('/:handle', async (request, reply) => {
        const { data, error } = await supabase_1.supabase
            .from('profiles')
            .select(mappers_1.PROFILE_SELECT_WITH_JOINS)
            .eq('handle', request.params.handle)
            .maybeSingle();
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!data) {
            return reply.status(404).send({ success: false, data: null, error: 'Profile not found' });
        }
        return reply.send({ success: true, data: (0, mappers_1.mapProfileRow)(data), error: null });
    });
};
exports.default = userRoutes;
//# sourceMappingURL=index.js.map