"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const supabase_1 = require("../../lib/supabase");
// OTPs are short-lived and per-process — in-memory storage is fine for a single API instance.
// Real delivery (email/SMS) is out of hackathon scope; see docs/AMENDMENTS.md.
const MOCK_OTP_STORE = new Map();
const sendOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().endsWith('@lpu.in', 'Must be a valid LPU email (@lpu.in)'),
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6),
});
/**
 * Auth routes: OTP send/verify, token refresh, logout
 */
const authRoutes = async (fastify) => {
    /**
     * POST /api/v1/auth/send-otp
     * Sends a 6-digit OTP to the provided LPU email address.
     */
    fastify.post('/send-otp', async (request, reply) => {
        const body = sendOtpSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({
                success: false,
                data: null,
                error: body.error.errors[0].message,
            });
        }
        const { email } = body.data;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
        MOCK_OTP_STORE.set(email, { otp, expires });
        fastify.log.info(`OTP for ${email}: ${otp}`); // In prod, send email instead
        const response = {
            success: true,
            data: {
                expiresIn: 600,
                ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
            },
            error: null,
        };
        return reply.status(200).send(response);
    });
    /**
     * POST /api/v1/auth/verify-otp
     * Verifies the OTP, upserts a real `users` row, and returns a JWT keyed to that row's UUID.
     */
    fastify.post('/verify-otp', async (request, reply) => {
        const body = verifyOtpSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({
                success: false,
                data: null,
                error: body.error.errors[0].message,
            });
        }
        const { email, otp } = body.data;
        const stored = MOCK_OTP_STORE.get(email);
        if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
            return reply.status(401).send({
                success: false,
                data: null,
                error: 'Invalid or expired OTP. Please request a new one.',
            });
        }
        MOCK_OTP_STORE.delete(email);
        // Find or create the user row for this LPU email.
        const { data: existingUser, error: findError } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('lpu_email', email)
            .maybeSingle();
        if (findError) {
            fastify.log.error(findError);
            return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }
        let userId;
        let isNewUser;
        if (existingUser) {
            userId = existingUser.id;
            isNewUser = false;
        }
        else {
            const { data: created, error: insertError } = await supabase_1.supabase
                .from('users')
                .insert({ lpu_email: email, is_active: true })
                .select('id')
                .single();
            if (insertError || !created) {
                fastify.log.error(insertError);
                return reply.status(500).send({ success: false, data: null, error: 'Failed to create user' });
            }
            userId = created.id;
            isNewUser = true;
        }
        // A user row existing doesn't mean onboarding is done — check for a completed profile.
        if (!isNewUser) {
            const { data: profile } = await supabase_1.supabase
                .from('profiles')
                .select('onboarding_complete')
                .eq('id', userId)
                .maybeSingle();
            isNewUser = !profile?.onboarding_complete;
        }
        const token = fastify.jwt.sign({ userId, email, role: 'student' }, { expiresIn: '7d' });
        const response = {
            success: true,
            data: { token, userId, isNewUser },
            error: null,
        };
        return reply.status(200).send(response);
    });
    /**
     * DELETE /api/v1/auth/logout
     * Invalidates the session. Client should also clear local token.
     */
    fastify.delete('/logout', async (_request, reply) => {
        // In prod: add token to Redis blocklist
        return reply.status(200).send({
            success: true,
            data: { message: 'Logged out successfully' },
            error: null,
        });
    });
};
exports.default = authRoutes;
//# sourceMappingURL=index.js.map