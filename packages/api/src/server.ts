import 'dotenv/config';
import { buildApp } from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  const app = buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Paladeium API running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
