import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, Quest, QuestProgress } from '../../../shared/src/types';

const MOCK_QUESTS: Quest[] = [
  {
    id: 'quest_explorer_1',
    title: 'Discover the Hidden Courtyard',
    description: 'Navigate to the serene courtyard behind Block 34 and check in to reveal this secret zone on your campus map.',
    type: 'explorer',
    xpReward: 150,
    edurevLinkage: false,
    locationRequired: true,
    targetLocation: { lat: 31.2528, lng: 75.7045, radiusMeters: 50 },
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quest_daily_1',
    title: 'Morning Mover',
    description: 'Visit the campus gym or sports complex before 9 AM to earn your daily streak bonus.',
    type: 'daily',
    xpReward: 50,
    edurevLinkage: false,
    locationRequired: true,
    targetLocation: { lat: 31.2545, lng: 75.7060, radiusMeters: 100 },
    isActive: true,
    expiresAt: new Date(new Date().setHours(23, 59, 59, 0)).toISOString(),
  },
  {
    id: 'quest_social_1',
    title: 'Squad Builder',
    description: 'Form a team of at least 3 members on SquadUp and register for an upcoming event together.',
    type: 'social',
    xpReward: 300,
    edurevLinkage: false,
    locationRequired: false,
    isActive: true,
  },
  {
    id: 'quest_academic_1',
    title: 'EduRev Pioneer',
    description: 'Log your first achievement on EduRevolution — any certification, competition win, or research paper counts.',
    type: 'academic',
    xpReward: 200,
    edurevLinkage: true,
    locationRequired: false,
    isActive: true,
  },
  {
    id: 'quest_weekly_1',
    title: 'Campus Cartographer',
    description: 'Reveal 5 new zones on the CampusVerse map this week by physically visiting those locations.',
    type: 'weekly',
    xpReward: 500,
    edurevLinkage: false,
    locationRequired: true,
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quest_explorer_2',
    title: 'Mac Lab Discovery',
    description: 'Find and check in at the iOS development lab in Block 34 — home to the Xcode setups.',
    type: 'explorer',
    xpReward: 100,
    edurevLinkage: false,
    locationRequired: true,
    targetLocation: { lat: 31.2531, lng: 75.7049, radiusMeters: 50 },
    isActive: true,
  },
];

const questRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/quests — active quests for user */
  fastify.get('/', { preHandler: requireAuth }, async (_request, reply) => {
    return reply.send({ success: true, data: MOCK_QUESTS, error: null } satisfies ApiResponse<Quest[]>);
  });

  /** GET /api/v1/quests/leaderboard */
  fastify.get('/leaderboard', async (_request, reply) => {
    const leaderboard = [
      { rank: 1, handle: 'rohan_blockchain', displayName: 'Rohan Mehta', campusXp: 12000, level: 7, department: 'ECE' },
      { rank: 2, handle: 'neha_devops', displayName: 'Neha Sharma', campusXp: 11200, level: 7, department: 'CSE' },
      { rank: 3, handle: 'aarav_sharma', displayName: 'Aarav Sharma', campusXp: 8400, level: 5, department: 'CSE' },
      { rank: 4, handle: 'ritika_research', displayName: 'Ritika Bhatia', campusXp: 7600, level: 5, department: 'BioTech' },
      { rank: 5, handle: 'sahil_cybersec', displayName: 'Sahil Verma', campusXp: 6800, level: 5, department: 'CSE' },
    ];
    return reply.send({ success: true, data: leaderboard, error: null });
  });

  /** POST /api/v1/quests/:id/verify — submit location for quest completion */
  fastify.post<{ Params: { id: string }; Body: { lat: number; lng: number } }>(
    '/:id/verify',
    { preHandler: requireAuth },
    async (request: any, reply) => {
      const quest = MOCK_QUESTS.find((q) => q.id === request.params.id);
      if (!quest) return reply.status(404).send({ success: false, data: null, error: 'Quest not found' });

      // In prod: verify GPS coordinates against target_location with radius check
      const progress: QuestProgress = {
        id: `prog_${Date.now()}`,
        profileId: request.user.userId,
        questId: quest.id,
        status: 'completed',
        completedAt: new Date().toISOString(),
        xpAwarded: quest.xpReward,
        quest,
      };

      return reply.send({ success: true, data: progress, error: null } satisfies ApiResponse<QuestProgress>);
    }
  );
};

export default questRoutes;
