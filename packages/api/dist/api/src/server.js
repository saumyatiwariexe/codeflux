"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const PORT = parseInt(process.env.PORT ?? '3000', 10);
async function main() {
    const app = (0, app_1.buildApp)();
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`\n🚀 Paladeium API running at http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=server.js.map