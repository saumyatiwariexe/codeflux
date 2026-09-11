import { FastifyPluginAsync } from 'fastify';
import { ApiResponse, Event } from '../../../../shared/src/types';

/** Mock events for demo */
const MOCK_EVENTS: Event[] = [
  {
    id: 'evt_hacklpu',
    title: 'HackLPU 2026: The National Innovation Odyssey',
    description: 'India\'s biggest university hackathon with ₹15,00,000 in prizes across 8 challenge tracks.',
    organizerId: 'club_scs',
    organizerType: 'club',
    locationName: 'LPU Main Auditorium, Block 38',
    locationCoords: { lat: 31.2534, lng: 75.7052 },
    blockReference: 'Block 38, Shatabdi Hall',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'hackathon',
    maxAttendees: 2000,
    registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    posterUrl: undefined,
    status: 'upcoming',
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    createdAt: new Date().toISOString(),
    attendeeCount: 842,
    tiers: [
      { id: 'tier_free', eventId: 'evt_hacklpu', name: 'General', price: 0, quantity: 2000, soldCount: 842 },
    ],
  },
  {
    id: 'evt_roboquest',
    title: 'RoboQuest: Autonomous Navigation Challenge',
    description: 'Design and program a robot to navigate a dynamic obstacle course.',
    organizerId: 'club_robotics',
    organizerType: 'club',
    locationName: 'Robotics Lab, Block 16',
    locationCoords: { lat: 31.2521, lng: 75.7048 },
    blockReference: 'Block 16, R-Lab',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    category: 'academic',
    maxAttendees: 120,
    posterUrl: undefined,
    status: 'upcoming',
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 3,
    createdAt: new Date().toISOString(),
    attendeeCount: 67,
  },
  {
    id: 'evt_designthon',
    title: 'DesignThon: AI UI/UX Sprint',
    description: '24-hour design sprint to reimagine AI interfaces. Top 3 teams win cash + internship offers.',
    organizerId: 'club_hci',
    organizerType: 'club',
    locationName: 'Design Studio, Block 32',
    locationCoords: { lat: 31.2528, lng: 75.7065 },
    blockReference: 'Block 32, Design Studio',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'hackathon',
    maxAttendees: 80,
    posterUrl: undefined,
    status: 'upcoming',
    isTeamEvent: true,
    minTeamSize: 1,
    maxTeamSize: 3,
    createdAt: new Date().toISOString(),
    attendeeCount: 54,
  },
  {
    id: 'evt_culturenight',
    title: 'Diwali Dhamaka: Campus Cultural Night',
    description: 'Annual cultural celebration with performances, dance, music, and food stalls from across India.',
    organizerId: 'admin',
    organizerType: 'admin',
    locationName: 'Uni Plaza, Central Lawn',
    locationCoords: { lat: 31.2542, lng: 75.7058 },
    blockReference: 'Central Campus Lawn',
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    category: 'cultural',
    maxAttendees: 5000,
    posterUrl: undefined,
    status: 'upcoming',
    isTeamEvent: false,
    createdAt: new Date().toISOString(),
    attendeeCount: 1240,
    tiers: [
      { id: 'tier_gen', eventId: 'evt_culturenight', name: 'General', price: 0, quantity: 4000, soldCount: 1240 },
      { id: 'tier_vip', eventId: 'evt_culturenight', name: 'VIP (Front Row + Backstage)', price: 199, quantity: 100, soldCount: 58 },
    ],
  },
];

/** Events routes */
const eventRoutes: FastifyPluginAsync = async (fastify) => {
  const requireAuth = async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { reply.status(401).send({ success: false, data: null, error: 'Unauthorized' }); }
  };

  /** GET /api/v1/events — list all events with optional category filter */
  fastify.get('/', async (request: any, reply) => {
    const { category, status } = request.query as { category?: string; status?: string };
    let events = [...MOCK_EVENTS];
    if (category) events = events.filter((e) => e.category === category);
    if (status) events = events.filter((e) => e.status === status);
    return reply.send({ success: true, data: events, error: null } satisfies ApiResponse<Event[]>);
  });

  /** GET /api/v1/events/:id — event detail */
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const event = MOCK_EVENTS.find((e) => e.id === request.params.id);
    if (!event) return reply.status(404).send({ success: false, data: null, error: 'Event not found' });
    return reply.send({ success: true, data: event, error: null } satisfies ApiResponse<Event>);
  });

  /** POST /api/v1/events/:id/rsvp — RSVP to a free event */
  fastify.post<{ Params: { id: string } }>('/:id/rsvp', { preHandler: requireAuth }, async (request: any, reply) => {
    const event = MOCK_EVENTS.find((e) => e.id === request.params.id);
    if (!event) return reply.status(404).send({ success: false, data: null, error: 'Event not found' });

    const bookingId = `TIX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const qrCode = Buffer.from(JSON.stringify({ bookingId, eventId: event.id, userId: request.user.userId })).toString('base64');

    return reply.status(201).send({
      success: true,
      data: {
        bookingId,
        qrCode,
        event: { id: event.id, title: event.title, startTime: event.startTime, locationName: event.locationName },
      },
      error: null,
    });
  });
};

export default eventRoutes;
