import { FastifyPluginAsync } from 'fastify';
import { ApiResponse } from '../../../shared/src/types';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/users/me */
  fastify.get('/me', { preHandler: requireAuth }, async (request: any, reply) => {
    return reply.send({
      success: true,
      data: {
        id: request.user.userId,
        handle: 'campus_user',
        displayName: 'Paladeium Demo User',
        department: 'CSE',
        year: 3,
        degreeLevel: 'UG',
        isDayScholar: false,
        hostelBlock: 'Block 32',
        campusXp: 3500,
        level: 4,
        squadVisibility: 'all',
        onboardingComplete: true,
        bio: 'Exploring LPU one quest at a time. 🚀',
        skills: [
          { skillId: 's_node', skill: { id: 's_node', name: 'Node.js', category: 'Tech' }, proficiency: 'intermediate' },
          { skillId: 's_react', skill: { id: 's_react', name: 'React Native', category: 'Tech' }, proficiency: 'beginner' },
        ],
        badges: [],
      },
      error: null,
    });
  });

  /** PATCH /api/v1/users/me — update profile */
  fastify.patch('/me', { preHandler: requireAuth }, async (request: any, reply) => {
    return reply.send({ success: true, data: { updated: true, ...request.body }, error: null });
  });

  /** GET /api/v1/users/:handle — public profile */
  fastify.get<{ Params: { handle: string } }>('/:handle', async (request, reply) => {
    return reply.send({
      success: true,
      data: {
        id: `profile_${request.params.handle}`,
        handle: request.params.handle,
        displayName: request.params.handle.replace(/_/g, ' '),
        department: 'CSE',
        year: 2,
        degreeLevel: 'UG' as const,
        isDayScholar: true,
        campusXp: 2000,
        level: 3,
        squadVisibility: 'all' as const,
        onboardingComplete: true,
      },
      error: null,
    });
  });
};

export default userRoutes;
