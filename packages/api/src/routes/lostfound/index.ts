import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, LostItem, FoundItem } from '../../../shared/src/types';

const MOCK_LOST: LostItem[] = [
  {
    id: 'lost_001',
    reporterId: 'profile_aarav',
    title: 'Black OnePlus 12R — Lost near Cafeteria',
    description: 'Lost my black OnePlus 12R near the main cafeteria around 1 PM. Has a cracked screen protector. IMEI locked.',
    category: 'electronics',
    lastSeenLocation: 'Main Cafeteria Block, Ground Floor',
    lastSeenAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lost_002',
    reporterId: 'profile_priya',
    title: 'LPU ID Card — Priya Krishnan',
    description: 'Lost my student ID card. Needed urgently for hostel access. Please contact if found.',
    category: 'id_card',
    lastSeenLocation: 'Library, 2nd Floor',
    lastSeenAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_FOUND: FoundItem[] = [
  {
    id: 'found_001',
    reporterId: 'profile_rohan',
    title: 'Found: Android Phone near Block 34',
    description: 'Found a phone with cracked back on the bench outside Block 34. Still has battery.',
    category: 'electronics',
    foundLocation: 'Outside Block 34, Bench near entrance',
    foundAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'unclaimed',
    reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const lostfoundRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  fastify.get('/lost', async (_req, reply) => {
    return reply.send({ success: true, data: MOCK_LOST, error: null } satisfies ApiResponse<LostItem[]>);
  });

  fastify.get('/found', async (_req, reply) => {
    return reply.send({ success: true, data: MOCK_FOUND, error: null } satisfies ApiResponse<FoundItem[]>);
  });

  fastify.post('/lost', { preHandler: requireAuth }, async (request: any, reply) => {
    const item: LostItem = {
      id: `lost_${Date.now()}`,
      reporterId: request.user.userId,
      status: 'open',
      reportedAt: new Date().toISOString(),
      ...(request.body as Partial<LostItem>),
      title: (request.body as any).title ?? 'Lost Item',
      description: (request.body as any).description ?? '',
      category: (request.body as any).category ?? 'other',
    };
    return reply.status(201).send({ success: true, data: item, error: null } satisfies ApiResponse<LostItem>);
  });

  fastify.post('/found', { preHandler: requireAuth }, async (request: any, reply) => {
    const item: FoundItem = {
      id: `found_${Date.now()}`,
      reporterId: request.user.userId,
      status: 'unclaimed',
      reportedAt: new Date().toISOString(),
      ...(request.body as Partial<FoundItem>),
      title: (request.body as any).title ?? 'Found Item',
      description: (request.body as any).description ?? '',
      category: (request.body as any).category ?? 'other',
    };
    return reply.status(201).send({ success: true, data: item, error: null } satisfies ApiResponse<FoundItem>);
  });

  fastify.get('/matches', { preHandler: requireAuth }, async (_req, reply) => {
    // Mock AI match — in prod: compare embeddings
    return reply.send({
      success: true,
      data: [{ lostItem: MOCK_LOST[0], matchedFound: MOCK_FOUND[0], score: 0.82 }],
      error: null,
    });
  });
};

export default lostfoundRoutes;
