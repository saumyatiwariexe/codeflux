import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, Quest, QuestProgress } from '../../../../shared/src/types';
import { supabase } from '../../lib/supabase';

const questRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/quests — active quests for user */
  fastify.get('/', { preHandler: requireAuth }, async (request: any, reply) => {
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true);

    if (questsError) return reply.status(500).send({ success: false, data: null, error: questsError.message });

    const { data: progress, error: progressError } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('profile_id', request.user.userId);

    if (progressError) return reply.status(500).send({ success: false, data: null, error: progressError.message });

    const mappedQuests: any[] = (quests || []).map((q: any) => {
      const userProgress = (progress || []).find((p: any) => p.quest_id === q.id);
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        type: q.type,
        xpReward: q.xp_reward,
        edurevLinkage: q.edurev_linkage,
        locationRequired: q.location_required,
        targetLocation: q.target_location ? {
          lat: q.target_location.lat,
          lng: q.target_location.lng,
          radiusMeters: q.target_location.radius_meters
        } : undefined,
        isActive: q.is_active,
        expiresAt: q.expires_at,
        status: userProgress ? userProgress.status : 'available',
        progress: userProgress ? 1 : 0,
        total: 1,
        icon: q.type === 'explorer' ? '🧭' : q.type === 'academic' ? '📚' : q.type === 'social' ? '🤝' : '⭐',
        timeLeft: q.expires_at ? 'Ends soon' : undefined
      };
    });

    return reply.send({ success: true, data: mappedQuests, error: null });
  });

  /** GET /api/v1/quests/leaderboard */
  fastify.get('/leaderboard', async (_request, reply) => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, handle, display_name, department, campus_xp, level')
      .order('campus_xp', { ascending: false })
      .limit(20);

    if (error) return reply.status(500).send({ success: false, data: null, error: error.message });

    const leaderboard = (profiles || []).map((p: any, index: number) => ({
      rank: index + 1,
      handle: p.handle,
      displayName: p.display_name,
      campusXp: p.campus_xp,
      level: p.level,
      department: p.department || 'Unknown'
    }));

    return reply.send({ success: true, data: leaderboard, error: null });
  });

  /** POST /api/v1/quests/:id/verify — submit location for quest completion */
  fastify.post<{ Params: { id: string }; Body: { lat: number; lng: number } }>(
    '/:id/verify',
    { preHandler: requireAuth },
    async (request: any, reply) => {
      const { id: questId } = request.params;
      const userId = request.user.userId;

      // 1. Fetch quest
      const { data: questData, error: qError } = await supabase.from('quests').select('*').eq('id', questId).single();
      if (qError || !questData) return reply.status(404).send({ success: false, data: null, error: 'Quest not found' });

      // 2. Check existing progress
      const { data: existingProgress } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('quest_id', questId)
        .eq('profile_id', userId)
        .single();
        
      if (existingProgress && existingProgress.status === 'completed') {
        return reply.status(400).send({ success: false, data: null, error: 'Quest already completed' });
      }

      // 3. Mark completed and award XP
      const xpToAward = questData.xp_reward;
      const { data: progressData, error: pError } = await supabase.from('quest_progress').upsert({
        id: existingProgress?.id || require('crypto').randomUUID(),
        profile_id: userId,
        quest_id: questId,
        status: 'completed',
        xp_awarded: xpToAward,
        completed_at: new Date().toISOString()
      }).select().single();

      if (pError) return reply.status(500).send({ success: false, data: null, error: pError.message });

      // 4. Update user Profile XP
      const { data: userProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('campus_xp, level')
        .eq('id', userId)
        .single();

      if (userProfile) {
        const newXp = (userProfile.campus_xp || 0) + xpToAward;
        const newLevel = Math.floor(newXp / 1000) + 1; // Simple level calc
        await supabase.from('profiles').update({ campus_xp: newXp, level: newLevel }).eq('id', userId);
      }

      const progress: QuestProgress = {
        id: progressData.id,
        profileId: userId,
        questId: questId,
        status: 'completed',
        completedAt: progressData.completed_at,
        xpAwarded: progressData.xp_awarded,
      };

      return reply.send({ success: true, data: progress, error: null } satisfies ApiResponse<QuestProgress>);
    }
  );
};

export default questRoutes;
