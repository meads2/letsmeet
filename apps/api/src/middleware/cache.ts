/**
 * Cache Middleware
 *
 * Provides response caching using Redis
 */

import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';

/**
 * Cache response data with Redis
 *
 * @param keyGenerator - Function to generate cache key from request
 * @param ttl - Time to live in seconds
 *
 * @example
 * fastify.get('/feed', {
 *   preHandler: [
 *     cacheResponse(
 *       (req) => `feed:${req.userId}:${req.query.limit}`,
 *       300 // 5 minutes
 *     )
 *   ]
 * });
 */
export function cacheResponse(
  keyGenerator: (request: FastifyRequest) => string,
  ttl: number
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const redis = request.server.redis;
    const cacheKey = keyGenerator(request);

    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);

      if (cached) {
        // Cache hit - return cached response
        request.log.debug({ cacheKey }, 'Cache HIT');
        reply.header('X-Cache', 'HIT');

        const data = JSON.parse(cached);
        return reply.send({
          success: true,
          data,
        });
      }

      // Cache miss - continue to route handler
      request.log.debug({ cacheKey }, 'Cache MISS');
      reply.header('X-Cache', 'MISS');

      // Intercept the response to cache it
      const originalSend = reply.send.bind(reply);
      reply.send = function (payload: any) {
        // Only cache successful responses
        if (payload?.success && payload?.data) {
          redis.set(cacheKey, JSON.stringify(payload.data), ttl).catch((error) => {
            request.log.error({ error, cacheKey }, 'Failed to cache response');
          });
        }
        return originalSend(payload);
      };
    } catch (error) {
      // Cache errors should not break requests
      request.log.error({ error, cacheKey }, 'Cache middleware error');
      reply.header('X-Cache', 'ERROR');
    }
  };
}

/**
 * Invalidate cache keys matching a pattern
 *
 * @example
 * // After creating a swipe, invalidate user's feed cache
 * await invalidateCachePattern(fastify.redis, `feed:${userId}:*`);
 */
export async function invalidateCachePattern(
  redis: any,
  pattern: string
): Promise<number> {
  return redis.invalidatePattern(pattern);
}
