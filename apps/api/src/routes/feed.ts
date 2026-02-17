/**
 * Feed Routes
 *
 * Endpoints for swipe feed discovery
 * REFACTORED: Now uses FeedService with Redis caching for performance
 */

import { FastifyPluginAsync } from 'fastify';
import { validateQuery } from '../middleware/validation';
import { feedQuerySchema } from '../validators';

const feedRoute: FastifyPluginAsync = async (fastify) => {
  const { feedService } = fastify.services;

  /**
   * GET /api/v1/feed
   * Get personalized swipe feed
   * Cached in Redis for 5 minutes to reduce expensive database queries
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    preHandler: [validateQuery(feedQuerySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { limit } = request.query as { limit: number };

    const profiles = await feedService.getPersonalizedFeed(userId, limit);

    return reply.send({
      success: true,
      data: profiles,
    });
  });

  /**
   * GET /api/v1/feed/count
   * Get available profiles count
   * Cached in Redis for 10 minutes
   */
  fastify.get('/count', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const count = await feedService.getFeedProfileCount(userId);

    return reply.send({
      success: true,
      data: { count },
    });
  });
};

export default feedRoute;
