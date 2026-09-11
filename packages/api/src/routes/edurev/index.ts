import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, EduRevAchievement, EduRevCategory } from '../../../../shared/src/types';

const MOCK_ACHIEVEMENTS: EduRevAchievement[] = [
  {
    id: 'ach_001',
    profileId: 'demo_user',
    title: 'AWS Cloud Practitioner Certification',
    description: 'Passed the AWS Cloud Practitioner exam with 90% score.',
    category: 'CERTIFICATION',
    status: 'approved',
    attendanceRelaxation: 5,
    gradeBenefit: 'Grade improvement in Cloud Computing elective',
    xpAwarded: 200,
    submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ach_002',
    profileId: 'demo_user',
    title: '2nd Place — National Hackathon, VIT Vellore',
    description: 'Built an AI-powered campus safety system in 24 hours. Team of 4. Won ₹50,000.',
    category: 'COMPETITION_WIN',
    status: 'approved',
    attendanceRelaxation: 8,
    gradeBenefit: 'Extra credit in Software Engineering',
    xpAwarded: 500,
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ach_003',
    profileId: 'demo_user',
    title: 'Research Paper: "Efficient Transformers for Edge Devices"',
    description: 'Co-authored paper accepted at IEEE ICISC 2026 conference. Under guidance of Dr. Singh.',
    category: 'RESEARCH_PAPER',
    status: 'pending',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const edurevRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/edurev/history */
  fastify.get('/history', { preHandler: requireAuth }, async (_req, reply) => {
    return reply.send({ success: true, data: MOCK_ACHIEVEMENTS, error: null } satisfies ApiResponse<EduRevAchievement[]>);
  });

  /** GET /api/v1/edurev/benefits — aggregate benefit calculation */
  fastify.get('/benefits', { preHandler: requireAuth }, async (_req, reply) => {
    const approved = MOCK_ACHIEVEMENTS.filter((a) => a.status === 'approved');
    const totalAttendanceRelaxation = approved.reduce((sum, a) => sum + (a.attendanceRelaxation ?? 0), 0);
    const totalXp = approved.reduce((sum, a) => sum + (a.xpAwarded ?? 0), 0);

    return reply.send({
      success: true,
      data: {
        approvedCount: approved.length,
        pendingCount: MOCK_ACHIEVEMENTS.filter((a) => a.status === 'pending').length,
        totalAttendanceRelaxation: Math.min(totalAttendanceRelaxation, 25), // LPU cap
        totalXpEarned: totalXp,
        achievements: approved,
      },
      error: null,
    });
  });

  /** POST /api/v1/edurev/achievement — log new achievement (AI-classifies) */
  fastify.post<{ Body: { title: string; description: string } }>(
    '/achievement',
    { preHandler: requireAuth },
    async (request: any, reply) => {
      const { title, description } = request.body;

      // Mock AI classification (in prod: call Anthropic API)
      const CATEGORY_KEYWORDS: [EduRevCategory, string[]][] = [
        ['RESEARCH_PAPER', ['paper', 'journal', 'conference', 'published', 'ieee', 'acm']],
        ['COMPETITION_WIN', ['hackathon', 'won', 'winner', 'prize', 'championship', 'rank']],
        ['CERTIFICATION', ['certified', 'certification', 'aws', 'google', 'nptel', 'coursera']],
        ['INTERNSHIP', ['internship', 'intern', 'stipend', 'company']],
        ['MOOC', ['course', 'mooc', 'udemy', 'coursera', 'edx', 'completed course']],
        ['STARTUP', ['startup', 'founded', 'registered', 'company', 'gst']],
      ];

      const lower = `${title} ${description}`.toLowerCase();
      let detectedCategory: EduRevCategory = 'CERTIFICATION';
      for (const [cat, keywords] of CATEGORY_KEYWORDS) {
        if (keywords.some((k) => lower.includes(k))) {
          detectedCategory = cat;
          break;
        }
      }

      const achievement: EduRevAchievement = {
        id: `ach_${Date.now()}`,
        profileId: request.user.userId,
        title,
        description,
        category: detectedCategory,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      return reply.status(201).send({ success: true, data: achievement, error: null } satisfies ApiResponse<EduRevAchievement>);
    }
  );
};

export default edurevRoutes;
