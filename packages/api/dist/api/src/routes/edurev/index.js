"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const supabase_1 = require("../../lib/supabase");
const auth_1 = require("../../lib/auth");
function mapAchievement(row) {
    return {
        id: row.id,
        profileId: row.profile_id,
        title: row.title,
        description: row.description ?? '',
        category: row.category,
        proofUrl: row.proof_url ?? undefined,
        status: row.status,
        attendanceRelaxation: row.attendance_relaxation ?? undefined,
        gradeBenefit: row.grade_benefit ?? undefined,
        xpAwarded: row.xp_awarded ?? undefined,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at ?? undefined,
        reviewNote: row.review_note ?? undefined,
    };
}
// LPU EduRevolution attendance-relaxation cap (see docs/PROBLEM_VALIDATION.md).
const ATTENDANCE_RELAXATION_CAP = 25;
const achievementSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1).max(1000),
});
const edurevRoutes = async (fastify) => {
    /** GET /api/v1/edurev/history */
    fastify.get('/history', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const { data, error } = await supabase_1.supabase
            .from('edurev_achievements')
            .select('*')
            .eq('profile_id', userId)
            .order('submitted_at', { ascending: false });
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        return reply.send({ success: true, data: (data ?? []).map(mapAchievement), error: null });
    });
    /** GET /api/v1/edurev/benefits — aggregate benefit calculation, fed by quest-linked + manual achievements (AMD-007) */
    fastify.get('/benefits', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const { data, error } = await supabase_1.supabase.from('edurev_achievements').select('*').eq('profile_id', userId);
        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        const all = data ?? [];
        const approved = all.filter((a) => a.status === 'approved' || a.status === 'submitted');
        const totalAttendanceRelaxation = approved.reduce((sum, a) => sum + (a.attendance_relaxation ?? 0), 0);
        const totalXp = approved.reduce((sum, a) => sum + (a.xp_awarded ?? 0), 0);
        return reply.send({
            success: true,
            data: {
                approvedCount: all.filter((a) => a.status === 'approved').length,
                pendingCount: all.filter((a) => a.status === 'pending' || a.status === 'submitted').length,
                totalAttendanceRelaxation: Math.min(totalAttendanceRelaxation, ATTENDANCE_RELAXATION_CAP),
                totalXpEarned: totalXp,
                achievements: approved.map(mapAchievement),
            },
            error: null,
        });
    });
    /**
     * POST /api/v1/edurev/achievement — manual log (keyword heuristic classification, NOT AI/ML — see docs/AMENDMENTS.md).
     * Quest-driven submissions bypass this route entirely (see routes/quests/index.ts :id/verify).
     */
    fastify.post('/achievement', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        const { userId } = request.user;
        const body = achievementSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ success: false, data: null, error: body.error.errors[0].message });
        }
        const { title, description } = body.data;
        const CATEGORY_KEYWORDS = [
            ['RESEARCH_PAPER', ['paper', 'journal', 'conference', 'published', 'ieee', 'acm']],
            ['COMPETITION_WIN', ['hackathon', 'won', 'winner', 'prize', 'championship', 'rank']],
            ['CERTIFICATION', ['certified', 'certification', 'aws', 'google', 'nptel', 'coursera']],
            ['INTERNSHIP', ['internship', 'intern', 'stipend', 'company']],
            ['MOOC', ['course', 'mooc', 'udemy', 'coursera', 'edx', 'completed course']],
            ['STARTUP', ['startup', 'founded', 'registered', 'company', 'gst']],
        ];
        const lower = `${title} ${description}`.toLowerCase();
        let detectedCategory = 'CERTIFICATION';
        for (const [cat, keywords] of CATEGORY_KEYWORDS) {
            if (keywords.some((k) => lower.includes(k))) {
                detectedCategory = cat;
                break;
            }
        }
        const { data, error } = await supabase_1.supabase
            .from('edurev_achievements')
            .insert({ profile_id: userId, title, description, category: detectedCategory, status: 'pending' })
            .select('*')
            .single();
        if (error || !data) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false, data: null, error: error?.message ?? 'Failed to log achievement' });
        }
        return reply.status(201).send({ success: true, data: mapAchievement(data), error: null });
    });
};
exports.default = edurevRoutes;
//# sourceMappingURL=index.js.map