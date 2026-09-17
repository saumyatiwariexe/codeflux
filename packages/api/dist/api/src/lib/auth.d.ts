import { FastifyReply, FastifyRequest } from 'fastify';
/** Singleton Clerk backend client — validates tokens and fetches user data. */
export declare const clerk: import("@clerk/backend").ClerkClient;
export interface ClerkJwtPayload {
    userId: string;
    email: string;
    role: string;
}
/**
 * Fastify preHandler — verifies the Clerk session token from the Authorization header.
 * Sets request.clerkUser if valid, 401s otherwise.
 * Attach this to any route that requires auth.
 */
export declare function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
//# sourceMappingURL=auth.d.ts.map