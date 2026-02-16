/**
 * Fastify Server Factory
 *
 * Creates and configures the Fastify application instance
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';
import { registerRoutes } from './routes';

export async function createServer() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport: env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Register CORS
  await fastify.register(cors, corsOptions);

  // Register rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    allowList: env.NODE_ENV === 'development' ? ['127.0.0.1'] : undefined,
  });

  // Register multipart for file uploads (if needed)
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
    },
  });

  // Register custom plugins
  await fastify.register(authPlugin);
  await fastify.register(errorHandlerPlugin);

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Register API routes
  await registerRoutes(fastify);

  return fastify;
}
