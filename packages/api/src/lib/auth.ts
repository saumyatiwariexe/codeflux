import { FastifyReply, FastifyRequest } from 'fastify';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/** Fastify preHandler — verifies the JWT, 401s otherwise. request.user is populated by @fastify/jwt. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
  }
}
