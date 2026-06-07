// 'dotenv/config' must be the very first import so process.env is populated
// before any other module reads it. In ESM, sibling imports are evaluated in
// order, so placing this first guarantees it runs before env.js validates.
import 'dotenv/config';

import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';
import app from './app.js';

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
  });

  // Graceful shutdown — allows in-flight requests to complete before exiting.
  // Kubernetes and other orchestrators send SIGTERM before force-killing.
  async function shutdown(signal) {
    logger.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
      await mongoose.connection.close();
      logger.info('HTTP server and DB connection closed — exiting');
      process.exit(0);
    });

    // Force-exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
