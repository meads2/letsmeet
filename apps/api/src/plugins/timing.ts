/**
 * Request Timing Plugin
 *
 * Tracks request duration and adds X-Response-Time header
 */

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const timingPlugin: FastifyPluginAsync = async (fastify) => {
  // Add onRequest hook to start timing
  fastify.addHook('onRequest', async (request, reply) => {
    (request as any).startTime = Date.now();
  });

  // Add onResponse hook to calculate and log duration
  fastify.addHook('onResponse', async (request, reply) => {
    const startTime = (request as any).startTime;
    if (!startTime) return;

    const duration = Date.now() - startTime;

    // Add response time header
    reply.header('X-Response-Time', `${duration}ms`);

    // Log slow requests (>1s)
    if (duration > 1000) {
      request.log.warn(
        {
          url: request.url,
          method: request.method,
          duration,
        },
        'Slow request detected'
      );
    }
  });

  fastify.log.info('Request timing enabled');
};

export default fp(timingPlugin, {
  name: 'timing',
});
