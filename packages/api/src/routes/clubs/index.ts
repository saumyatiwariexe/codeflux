import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, Club } from '../../../shared/src/types';

const MOCK_CLUBS: Club[] = [
  {
    id: 'club_acm',
    name: 'ACM Student Chapter LPU',
    slug: 'acm-lpu',
    description: 'The world\'s largest computing society chapter at LPU. Coding contests, tech talks, and placement prep.',
    category: 'tech',
    memberCount: 420,
    isRecruiting: true,
    applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    socialLinks: { instagram: '@acmlpu', linkedin: 'acm-lpu' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club_gdsc',
    name: 'Google Developer Student Club',
    slug: 'gdsc-lpu',
    description: 'Build. Learn. Grow. Google-backed developer community focused on mobile and cloud development.',
    category: 'tech',
    memberCount: 380,
    isRecruiting: true,
    socialLinks: { instagram: '@gdsc_lpu', website: 'gdsc.community/lpu' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club_robotics',
    name: 'Robotics Club LPU',
    slug: 'robotics-lpu',
    description: 'From Arduino to full autonomous robots — we build machines that move. SIH and Robocon regulars.',
    category: 'tech',
    memberCount: 180,
    isRecruiting: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club_spicmacay',
    name: 'SPIC MACAY LPU Chapter',
    slug: 'spicmacay-lpu',
    description: 'Promoting classical Indian arts and culture. Hosts national-level cultural galas and maestro performances.',
    category: 'cultural',
    memberCount: 250,
    isRecruiting: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club_entrepreneur',
    name: 'Entrepreneurship Cell LPU',
    slug: 'ecell-lpu',
    description: 'Turn your idea into a startup. ₹1Cr+ funding facilitated. Home of LPU\'s most successful founders.',
    category: 'academic',
    memberCount: 310,
    isRecruiting: true,
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const clubRoutes: FastifyPluginAsync = async (fastify) => {
  /** GET /api/v1/clubs */
  fastify.get('/', async (request: any, reply) => {
    const { category, recruiting } = request.query as { category?: string; recruiting?: string };
    let clubs = [...MOCK_CLUBS];
    if (category) clubs = clubs.filter((c) => c.category === category);
    if (recruiting === 'true') clubs = clubs.filter((c) => c.isRecruiting);
    return reply.send({ success: true, data: clubs, error: null } satisfies ApiResponse<Club[]>);
  });

  /** GET /api/v1/clubs/:slug */
  fastify.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const club = MOCK_CLUBS.find((c) => c.slug === request.params.slug);
    if (!club) return reply.status(404).send({ success: false, data: null, error: 'Club not found' });
    return reply.send({ success: true, data: club, error: null } satisfies ApiResponse<Club>);
  });
};

export default clubRoutes;
