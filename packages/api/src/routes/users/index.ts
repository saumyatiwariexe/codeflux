import { FastifyPluginAsync } from 'fastify';
import { ApiResponse } from '../../../../shared/src/types';
import { supabase } from '../../lib/supabase';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/users/me */
  fastify.get('/me', { preHandler: requireAuth }, async (request: any, reply) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', request.user.userId)
      .single();

    if (error || !profile) {
      return reply.status(404).send({ success: false, data: null, error: 'Profile not found' });
    }

    const mappedProfile = {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      department: profile.department,
      year: profile.year,
      degreeLevel: profile.degree_level,
      hostelBlock: profile.hostel_block,
      isDayScholar: profile.is_day_scholar,
      campusXp: profile.campus_xp || 0,
      level: profile.level || 1,
      squadVisibility: profile.squad_visibility,
      onboardingComplete: profile.onboarding_complete,
      skills: [], // We can fetch from profile_skills later if needed
      badges: [], // We can fetch from profile_badges later if needed
    };

    return reply.send({ success: true, data: mappedProfile, error: null });
  });

  /** PATCH /api/v1/users/me — update profile */
  fastify.patch('/me', { preHandler: requireAuth }, async (request: any, reply) => {
    const updates = request.body as Record<string, any>;
    
    // Map camelCase to snake_case for DB
    const dbUpdates: Record<string, any> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.degreeLevel !== undefined) dbUpdates.degree_level = updates.degreeLevel;
    if (updates.hostelBlock !== undefined) dbUpdates.hostel_block = updates.hostelBlock;
    if (updates.isDayScholar !== undefined) dbUpdates.is_day_scholar = updates.isDayScholar;
    if (updates.squadVisibility !== undefined) dbUpdates.squad_visibility = updates.squadVisibility;
    if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_complete = updates.onboardingComplete;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', request.user.userId)
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ success: false, data: null, error: error.message });
    }

    return reply.send({ success: true, data: { updated: true, ...data }, error: null });
  });

  /** GET /api/v1/users/:handle — public profile */
  fastify.get<{ Params: { handle: string } }>('/:handle', async (request, reply) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, handle, display_name, department, year, degree_level, is_day_scholar, campus_xp, level, squad_visibility, onboarding_complete, bio, avatar_url')
      .eq('handle', request.params.handle)
      .single();

    if (error || !profile) {
      return reply.status(404).send({ success: false, data: null, error: 'Profile not found' });
    }
    
    const mappedProfile = {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.display_name,
      department: profile.department,
      year: profile.year,
      degreeLevel: profile.degree_level,
      isDayScholar: profile.is_day_scholar,
      campusXp: profile.campus_xp,
      level: profile.level,
      squadVisibility: profile.squad_visibility,
      onboardingComplete: profile.onboarding_complete,
      bio: profile.bio,
      avatarUrl: profile.avatar_url
    };

    return reply.send({ success: true, data: mappedProfile, error: null });
  });
};

export default userRoutes;
