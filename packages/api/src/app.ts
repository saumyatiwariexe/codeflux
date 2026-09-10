import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

// ---- Route imports ----
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import squadRoutes from './routes/squad';
import eventRoutes from './routes/events';
import questRoutes from './routes/quests';
import edurevRoutes from './routes/edurev';
import lostfoundRoutes from './routes/lostfound';
import clubRoutes from './routes/clubs';

/**
 * Creates and configures the Fastify application instance.
 * Call this factory to get a fully configured app for server or testing.
 */
export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // ---- Plugins ----
  app.register(cors, {
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  });

  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  });

  // ---- Health check ----
  app.get('/health', async () => ({
    status: 'ok',
    service: 'campus-pulse-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

  // ---- API Routes (v1) ----
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(userRoutes, { prefix: '/api/v1/users' });
  app.register(squadRoutes, { prefix: '/api/v1/squad' });
  app.register(eventRoutes, { prefix: '/api/v1/events' });
  app.register(questRoutes, { prefix: '/api/v1/quests' });
  app.register(edurevRoutes, { prefix: '/api/v1/edurev' });
  app.register(lostfoundRoutes, { prefix: '/api/v1/lostfound' });
  app.register(clubRoutes, { prefix: '/api/v1/clubs' });

  // ---- Global error handler ----
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      success: false,
      data: null,
      error: statusCode === 500 ? 'Internal server error' : error.message,
    });
  });

  return app;
}
