/**
 * API Server Entry Point
 *
 * Starts the Fastify backend server
 */

import 'dotenv/config';
import { createServer } from './server';
import { env } from './config/env';

async function start() {
  try {
    const server = await createServer();

    // Start listening
    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Server ready at http://${env.HOST}:${env.PORT}`);
    console.log(`📋 Health check: http://${env.HOST}:${env.PORT}/health`);
    console.log(`🔌 API endpoints: http://${env.HOST}:${env.PORT}/api/v1`);
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

start();
