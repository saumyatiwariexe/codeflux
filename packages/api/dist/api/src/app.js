"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
// ---- Route imports ----
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const squad_1 = __importDefault(require("./routes/squad"));
const events_1 = __importDefault(require("./routes/events"));
const quests_1 = __importDefault(require("./routes/quests"));
const edurev_1 = __importDefault(require("./routes/edurev"));
const lostfound_1 = __importDefault(require("./routes/lostfound"));
const clubs_1 = __importDefault(require("./routes/clubs"));
/**
 * Creates and configures the Fastify application instance.
 * Call this factory to get a fully configured app for server or testing.
 */
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
            transport: {
                target: 'pino-pretty',
                options: { colorize: true },
            },
        },
    });
    // ---- Plugins ----
    app.register(cors_1.default, {
        origin: process.env.FRONTEND_URL ?? '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.register(jwt_1.default, {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    });
    app.register(rate_limit_1.default, {
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
    app.register(auth_1.default, { prefix: '/api/v1/auth' });
    app.register(users_1.default, { prefix: '/api/v1/users' });
    app.register(squad_1.default, { prefix: '/api/v1/squad' });
    app.register(events_1.default, { prefix: '/api/v1/events' });
    app.register(quests_1.default, { prefix: '/api/v1/quests' });
    app.register(edurev_1.default, { prefix: '/api/v1/edurev' });
    app.register(lostfound_1.default, { prefix: '/api/v1/lostfound' });
    app.register(clubs_1.default, { prefix: '/api/v1/clubs' });
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
//# sourceMappingURL=app.js.map