"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../../lib/supabase");
const auth_1 = require("../../lib/auth");
function mapEvent(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        organizerId: row.organizer_id,
        organizerType: row.organizer_type,
        locationName: row.location_name ?? undefined,
        locationCoords: row.location_coords ?? undefined,
        blockReference: row.block_reference ?? undefined,
        startTime: row.start_time,
        endTime: row.end_time,
        category: row.category,
        maxAttendees: row.max_attendees ?? undefined,
        registrationDeadline: row.registration_deadline ?? undefined,
        posterUrl: row.poster_url ?? undefined,
        status: row.status,
        isTeamEvent: row.is_team_event,
        minTeamSize: row.min_team_size ?? undefined,
        maxTeamSize: row.max_team_size ?? undefined,
        createdAt: row.created_at,
        tiers: row.ticket_tiers?.map((t) => ({
            id: t.id,
            eventId: row.id,
            name: t.name,
            price: Number(t.price),
            quantity: t.quantity ?? undefined,
            perks: t.perks ?? undefined,
            soldCount: t.sold_count,
        })),
    };
}
/** Events routes */
const eventRoutes = async (fastify) => {
    /** GET /api/v1/events — list all events with optional category/status filter */
    fastify.get('/', async (request, reply) => {
        const { category, status } = request.query;
        let query = supabase_1.supabase.from('events').select('*, ticket_tiers(*)').order('start_time', { ascending: true });
        if (category)
            query = query.eq('category', category);
        if (status)
            query = query.eq('status', status);
        const { data, error } = await query;
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        return reply.send({ success: true, data: (data ?? []).map(mapEvent), error: null });
    });
    /** GET /api/v1/events/:id — event detail */
    fastify.get('/:id', async (request, reply) => {
        const { data, error } = await supabase_1.supabase
            .from('events')
            .select('*, ticket_tiers(*)')
            .eq('id', request.params.id)
            .maybeSingle();
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!data)
            return reply.status(404).send({ success: false, data: null, error: 'Event not found' });
        return reply.send({ success: true, data: mapEvent(data), error: null });
    });
    /** POST /api/v1/events/:id/rsvp — RSVP to the event's free/general tier */
    fastify.post('/:id/rsvp', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const eventId = request.params.id;
        const { data: event, error: eventErr } = await supabase_1.supabase
            .from('events')
            .select('id, title, start_time, location_name')
            .eq('id', eventId)
            .maybeSingle();
        if (eventErr) {
            fastify.log.error(eventErr);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        if (!event)
            return reply.status(404).send({ success: false, data: null, error: 'Event not found' });
        let { data: tier } = await supabase_1.supabase
            .from('ticket_tiers')
            .select('id')
            .eq('event_id', eventId)
            .order('price', { ascending: true })
            .limit(1)
            .maybeSingle();
        if (!tier) {
            const { data: createdTier, error: tierErr } = await supabase_1.supabase
                .from('ticket_tiers')
                .insert({ event_id: eventId, name: 'General', price: 0 })
                .select('id')
                .single();
            if (tierErr || !createdTier) {
                fastify.log.error(tierErr);
                return reply.status(500).send({ success: false, data: null, error: 'Failed to create RSVP tier' });
            }
            tier = createdTier;
        }
        const bookingId = `TIX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const qrCode = Buffer.from(JSON.stringify({ bookingId, eventId, userId })).toString('base64');
        const { error: ticketErr } = await supabase_1.supabase.from('tickets').insert({
            tier_id: tier.id,
            event_id: eventId,
            holder_id: userId,
            qr_code: qrCode,
            booking_id: bookingId,
        });
        if (ticketErr) {
            fastify.log.error(ticketErr);
            return reply.status(500).send({ success: false, data: null, error: 'Failed to RSVP' });
        }
        const { data: tierRow } = await supabase_1.supabase.from('ticket_tiers').select('sold_count').eq('id', tier.id).single();
        if (tierRow) {
            await supabase_1.supabase.from('ticket_tiers').update({ sold_count: tierRow.sold_count + 1 }).eq('id', tier.id);
        }
        return reply.status(201).send({
            success: true,
            data: {
                bookingId,
                qrCode,
                event: { id: event.id, title: event.title, startTime: event.start_time, locationName: event.location_name },
            },
            error: null,
        });
    });
};
exports.default = eventRoutes;
//# sourceMappingURL=index.js.map