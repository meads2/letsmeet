/**
 * Fastify Server Factory
 *
 * Creates and configures the Fastify application instance
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import compress from '@fastify/compress';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';
import redisPlugin from './plugins/redis';
import securityPlugin from './plugins/security';
import timingPlugin from './plugins/timing';
import { registerRoutes } from './routes';
import { createServices } from './services';

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

  // Register compression (before routes)
  await fastify.register(compress, {
    global: true,
    threshold: 1024, // Only compress responses larger than 1KB
    encodings: ['gzip', 'deflate'],
  });

  // Register security headers
  await fastify.register(securityPlugin);

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
  await fastify.register(redisPlugin);
  await fastify.register(timingPlugin);
  await fastify.register(authPlugin);
  await fastify.register(errorHandlerPlugin);

  // Initialize services with Redis client
  const services = createServices(fastify.redis);
  fastify.decorate('services', services);

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
