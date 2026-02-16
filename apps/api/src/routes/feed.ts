/**
 * Feed Routes
 *
 * Endpoints for swipe feed discovery
 */

import { FastifyPluginAsync } from 'fastify';
import { getFeedForUser, getFeedCount } from '@letsmeet/database';

const feedRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/feed
   * Get personalized swipe feed
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { limit = '20' } = request.query as { limit?: string };

    const profiles = await getFeedForUser(userId, parseInt(limit, 10));

    return reply.send({
      success: true,
      data: profiles,
    });
  });

  /**
   * GET /api/v1/feed/count
   * Get available profiles count
   */
  fastify.get('/count', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const count = await getFeedCount(userId);

    return reply.send({
      success: true,
      data: { count },
    });
  });
};

export default feedRoute;
