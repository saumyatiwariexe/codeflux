import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse, LostItem, FoundItem, LostFoundCategory } from '../../../../shared/src/types';
import { supabase } from '../../lib/supabase';
import { requireAuth, JwtPayload } from '../../lib/auth';

const CATEGORIES: LostFoundCategory[] = ['electronics', 'bag', 'wallet', 'id_card', 'keys', 'clothing', 'books', 'other'];

const lostItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  lastSeenLocation: z.string().optional(),
  lastSeenAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
});

const foundItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  foundLocation: z.string().optional(),
  foundAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
});

function mapLost(row: any): LostItem {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    title: row.title,
    description: row.description,
    category: row.category,
    lastSeenLocation: row.last_seen_location ?? undefined,
    lastSeenAt: row.last_seen_at ?? undefined,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    reportedAt: row.reported_at,
  };
}

function mapFound(row: any): FoundItem {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    title: row.title,
    description: row.description,
    category: row.category,
    foundLocation: row.found_location ?? undefined,
    foundAt: row.found_at ?? undefined,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    reportedAt: row.reported_at,
  };
}

/** Word-overlap heuristic — NOT AI/ML. Real image/embedding matching is future scope. */
function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

const lostfoundRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/lost', async (_req, reply) => {
    const { data, error } = await supabase.from('lost_items').select('*').order('reported_at', { ascending: false });
    if (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }
    return reply.send({ success: true, data: (data ?? []).map(mapLost), error: null } satisfies ApiResponse<LostItem[]>);
  });

  fastify.get('/found', async (_req, reply) => {
    const { data, error } = await supabase.from('found_items').select('*').order('reported_at', { ascending: false });
    if (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }
    return reply.send({ success: true, data: (data ?? []).map(mapFound), error: null } satisfies ApiResponse<FoundItem[]>);
  });

  fastify.post('/lost', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;
    const body = lostItemSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
    }

    const { data, error } = await supabase
      .from('lost_items')
      .insert({
        reporter_id: userId,
        title: body.data.title,
        description: body.data.description,
        category: body.data.category,
        last_seen_location: body.data.lastSeenLocation,
        last_seen_at: body.data.lastSeenAt,
        image_url: body.data.imageUrl,
      })
      .select('*')
      .single();

    if (error || !data) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: error?.message ?? 'Failed to post item' });
    }

    return reply.status(201).send({ success: true, data: mapLost(data), error: null } satisfies ApiResponse<LostItem>);
  });

  fastify.post('/found', { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as JwtPayload;
    const body = foundItemSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
    }

    const { data, error } = await supabase
      .from('found_items')
      .insert({
        reporter_id: userId,
        title: body.data.title,
        description: body.data.description,
        category: body.data.category,
        found_location: body.data.foundLocation,
        found_at: body.data.foundAt,
        image_url: body.data.imageUrl,
      })
      .select('*')
      .single();

    if (error || !data) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, data: null, error: error?.message ?? 'Failed to post item' });
    }

    return reply.status(201).send({ success: true, data: mapFound(data), error: null } satisfies ApiResponse<FoundItem>);
  });

  /** GET /api/v1/lostfound/matches — heuristic category + text-overlap match, real data, no ML. */
  fastify.get('/matches', { preHandler: requireAuth }, async (_req, reply) => {
    const [{ data: lost, error: lostErr }, { data: found, error: foundErr }] = await Promise.all([
      supabase.from('lost_items').select('*').eq('status', 'open'),
      supabase.from('found_items').select('*').eq('status', 'unclaimed'),
    ]);

    if (lostErr || foundErr) {
      fastify.log.error(lostErr ?? foundErr);
      return reply.status(500).send({ success: false, data: null, error: 'Database error' });
    }

    const matches: { lostItem: LostItem; matchedFound: FoundItem; score: number }[] = [];
    for (const l of lost ?? []) {
      for (const f of found ?? []) {
        if (l.category !== f.category) continue;
        const score = textSimilarity(`${l.title} ${l.description}`, `${f.title} ${f.description}`);
        if (score > 0.15) {
          matches.push({ lostItem: mapLost(l), matchedFound: mapFound(f), score: Math.round(score * 100) / 100 });
        }
      }
    }
    matches.sort((a, b) => b.score - a.score);

    return reply.send({ success: true, data: matches, error: null });
  });
};

export default lostfoundRoutes;
