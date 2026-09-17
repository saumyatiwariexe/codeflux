import { FastifyReply, FastifyRequest } from 'fastify';
import { createClerkClient } from '@clerk/backend';

/** Singleton Clerk backend client — validates tokens and fetches user data. */
export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY ?? '',
});

export interface ClerkJwtPayload {
  userId: string;   // Clerk user ID (sub claim)
  email: string;
  role: string;
}

/**
 * Fastify preHandler — verifies the Clerk session token from the Authorization header.
 * Sets request.clerkUser if valid, 401s otherwise.
 * Attach this to any route that requires auth.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
    }

    const sessionToken = authHeader.slice(7);
    const payload = await clerk.verifyToken(sessionToken);

    // Attach the Clerk user ID to the request for downstream use
    (request as any).clerkUserId = payload.sub;
  } catch {
    reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
  }
}
