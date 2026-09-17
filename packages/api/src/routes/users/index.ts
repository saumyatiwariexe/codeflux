import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse } from '../../../../shared/src/types';
import { supabase } from '../../lib/supabase';
import { requireAuth, JwtPayload } from '../../lib/auth';
import { mapProfileRow, PROFILE_SELECT_WITH_JOINS } from '../../lib/mappers';

const updateProfileSchema = z.object({
  handle: z.string().regex(/^[a-z0-9_]{3,30}$/).optional(),
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(300).optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(6).optional(),
  degreeLevel: z.enum(['UG', 'PG', 'PhD']).optional(),
  stream: z.string().optional(),
  pronouns: z.string().optional(),
  hostelBlock: z.string().optional(),
  isDayScholar: z.boolean().optional(),
  squadVisibility: z.enum(['all', 'dept', 'off']).optional(),
  onboardingComplete: z.boolean().optional(),
  avatarUrl: z.string().url().optional(),
  skillIds: z.array(z.object({ skillId: z.string(), proficiency: z.enum(['beginner', 'intermediate', 'expert']) })).optional(),
});

const userRoutes: FastifyPluginAsync = async (fastify) => {
  /** GET /api/v1/users/me */
  fastify.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_WITH_JOINS)
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

    return reply.send({ success: true, data: mapProfileRow(data), error: null });
  });

  /**
   * PATCH /api/v1/users/me — create-or-update profile (upsert).
   * Doubles as the onboarding endpoint: the first call with `handle` + `displayName`
   * creates the row (profiles.id references users.id 1:1).
   */
  fastify.patch('/me', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;
    const body = updateProfileSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
    }

    const { skillIds, ...profileFields } = body.data;

    const columnMap: Record<string, unknown> = {
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

    const { data: upserted, error } = await supabase
      .from('profiles')
      .upsert(columnMap, { onConflict: 'id' })
      .select(PROFILE_SELECT_WITH_JOINS)
      .single();

    if (error || !upserted) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: error?.message ?? 'Failed to save profile' });
    }

    if (skillIds) {
      await supabase.from('profile_skills').delete().eq('profile_id', userId);
      if (skillIds.length > 0) {
        await supabase.from('profile_skills').insert(
          skillIds.map((s) => ({ profile_id: userId, skill_id: s.skillId, proficiency: s.proficiency }))
        );
      }
      const { data: refreshed } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT_WITH_JOINS)
        .eq('id', userId)
        .single();
      return reply.send({ success: true, data: mapProfileRow(refreshed), error: null });
    }

    return reply.send({ success: true, data: mapProfileRow(upserted), error: null });
  });

  /** GET /api/v1/users/:handle — public profile */
  fastify.get<{ Params: { handle: string } }>('/:handle', async (request, reply) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_WITH_JOINS)
      .eq('handle', request.params.handle)
      .maybeSingle();

    if (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }
    if (!data) {
      return reply.status(404).send({ success: false, data: null, error: 'Profile not found' });
    }

    return reply.send({ success: true, data: mapProfileRow(data), error: null });
  });
};

export default userRoutes;
