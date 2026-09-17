"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../../lib/supabase");
function mapClub(row) {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? undefined,
        category: row.category,
        logoUrl: row.logo_url ?? undefined,
        bannerUrl: row.banner_url ?? undefined,
        memberCount: row.member_count,
        isRecruiting: row.is_recruiting,
        applicationDeadline: row.application_deadline ?? undefined,
        socialLinks: row.social_links ?? undefined,
        createdAt: row.created_at,
    };
}
const clubRoutes = async (fastify) => {
    /** GET /api/v1/clubs */
    fastify.get('/', async (request, reply) => {
        const { category, recruiting } = request.query;
        let query = supabase_1.supabase.from('clubs').select('*').order('member_count', { ascending: false });
        if (category)
            query = query.eq('category', category);
        if (recruiting === 'true')
            query = query.eq('is_recruiting', true);
        const { data, error } = await query;
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        return reply.send({ success: true, data: (data ?? []).map(mapClub), error: null });
    });
    /** GET /api/v1/clubs/:slug */
    fastify.get('/:slug', async (request, reply) => {
        const { data, error } = await supabase_1.supabase.from('clubs').select('*').eq('slug', request.params.slug).maybeSingle();
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!data)
            return reply.status(404).send({ success: false, data: null, error: 'Club not found' });
        return reply.send({ success: true, data: mapClub(data), error: null });
    });
};
exports.default = clubRoutes;
//# sourceMappingURL=index.js.map