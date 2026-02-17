/**
 * Redis Plugin
 *
 * Initializes Redis client and decorates Fastify with Redis utilities
 */

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { env } from '../config/env';

/**
 * Redis utility interface for cache operations
 */
export interface RedisClient {
  /**
   * Get a value from cache
   */
  get(key: string): Promise<string | null>;

  /**
   * Set a value in cache with optional TTL (seconds)
   */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Delete a key from cache
   */
  del(key: string): Promise<void>;

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Delete all keys matching a pattern
   * @example invalidatePattern('feed:*') - Delete all feed cache keys
   */
  invalidatePattern(pattern: string): Promise<number>;

  /**
   * Get raw Redis client for advanced operations
   */
  client: Redis;
}

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClient;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  // Attach error listener before connecting to prevent unhandled error event crashes
  redisClient.on('error', (err) => {
    fastify.log.debug({ err }, 'Redis error (non-fatal)');
  });

  try {
    await redisClient.connect();
    fastify.log.info('Redis connected successfully');
  } catch (error) {
    fastify.log.warn('Redis unavailable - running without cache (performance may be reduced)');
    // Continue without Redis - cache operations fail open
  }

  // Create utility wrapper
  const redis: RedisClient = {
    async get(key: string): Promise<string | null> {
      try {
        return await redisClient.get(key);
      } catch (error) {
        fastify.log.error({ error, key }, 'Redis GET error');
        return null; // Fail open - return cache miss
      }
    },

    async set(key: string, value: string, ttl?: number): Promise<void> {
      try {
        if (ttl) {
          await redisClient.setex(key, ttl, value);
        } else {
          await redisClient.set(key, value);
        }
      } catch (error) {
        fastify.log.error({ error, key }, 'Redis SET error');
        // Fail silently - cache write failures shouldn't break requests
      }
    },

    async del(key: string): Promise<void> {
      try {
        await redisClient.del(key);
      } catch (error) {
        fastify.log.error({ error, key }, 'Redis DEL error');
      }
    },

    async exists(key: string): Promise<boolean> {
      try {
        const result = await redisClient.exists(key);
        return result === 1;
      } catch (error) {
        fastify.log.error({ error, key }, 'Redis EXISTS error');
        return false;
      }
    },

    async invalidatePattern(pattern: string): Promise<number> {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length === 0) return 0;

        const pipeline = redisClient.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        fastify.log.debug({ pattern, count: keys.length }, 'Cache pattern invalidated');
        return keys.length;
      } catch (error) {
        fastify.log.error({ error, pattern }, 'Redis pattern invalidation error');
        return 0;
      }
    },

    client: redisClient,
  };

  // Decorate Fastify instance
  fastify.decorate('redis', redis);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await redisClient.quit();
    fastify.log.info('Redis connection closed');
  });
};

export default fp(redisPlugin, {
  name: 'redis',
});
