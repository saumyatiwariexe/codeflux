import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiResponse } from '../../../../shared/src/types';

// ---- Mock data for hackathon demo ----
const MOCK_OTP_STORE = new Map<string, { otp: string; expires: number }>();

const sendOtpSchema = z.object({
  email: z.string().email().endsWith('@lpu.in', 'Must be a valid LPU email (@lpu.in)'),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

/**
 * Auth routes: OTP send/verify, token refresh, logout
 */
const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/auth/send-otp
   * Sends a 6-digit OTP to the provided LPU email address.
   * In production: uses Firebase Auth or Nodemailer.
   * In demo mode: returns the OTP in the response (dev only).
   */
  fastify.post<{ Body: z.infer<typeof sendOtpSchema> }>('/send-otp', async (request, reply) => {
    const body = sendOtpSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        data: null,
        error: body.error.errors[0].message,
      } satisfies ApiResponse<null>);
    }

    const { email } = body.data;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    MOCK_OTP_STORE.set(email, { otp, expires });

    fastify.log.info(`OTP for ${email}: ${otp}`); // In prod, send email instead

    const response: ApiResponse<{ expiresIn: number; devOtp?: string }> = {
      success: true,
      data: {
        expiresIn: 600,
        // Only expose OTP in non-production for demo
        ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
      },
      error: null,
    };

    return reply.status(200).send(response);
  });

  /**
   * POST /api/v1/auth/verify-otp
   * Verifies the OTP and returns a JWT access token.
   */
  fastify.post<{ Body: z.infer<typeof verifyOtpSchema> }>('/verify-otp', async (request, reply) => {
    const body = verifyOtpSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        data: null,
        error: body.error.errors[0].message,
      } satisfies ApiResponse<null>);
    }

    const { email, otp } = body.data;
    const stored = MOCK_OTP_STORE.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return reply.status(401).send({
        success: false,
        data: null,
        error: 'Invalid or expired OTP. Please request a new one.',
      } satisfies ApiResponse<null>);
    }

    MOCK_OTP_STORE.delete(email);

    // Generate mock user (in prod, create/fetch from Supabase)
    const mockUserId = `user_${email.replace('@lpu.in', '').replace(/\W/g, '_')}`;
    const token = fastify.jwt.sign(
      { userId: mockUserId, email, role: 'student' },
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{
      token: string;
      userId: string;
      isNewUser: boolean;
    }> = {
      success: true,
      data: {
        token,
        userId: mockUserId,
        isNewUser: true, // In prod: check if profile exists in DB
      },
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
    } satisfies ApiResponse<{ message: string }>);
  });
};

export default authRoutes;
