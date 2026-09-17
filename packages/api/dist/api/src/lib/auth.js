"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerk = void 0;
exports.requireAuth = requireAuth;
const backend_1 = require("@clerk/backend");
/** Singleton Clerk backend client — validates tokens and fetches user data. */
exports.clerk = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
});
/**
 * Fastify preHandler — verifies the Clerk session token from the Authorization header.
 * Sets request.clerkUser if valid, 401s otherwise.
 * Attach this to any route that requires auth.
 */
async function requireAuth(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
        }
        const sessionToken = authHeader.slice(7);
        const payload = await exports.clerk.verifyToken(sessionToken);
        // Attach the Clerk user ID to the request for downstream use
        request.clerkUserId = payload.sub;
    }
    catch {
        reply.status(401).send({ success: false, data: null, error: 'Unauthorized' });
    }
}
//# sourceMappingURL=auth.js.map