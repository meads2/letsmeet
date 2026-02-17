/**
 * Swipe Routes
 *
 * Endpoints for swiping and match detection
 * REFACTORED: Now uses SwipeService with limit enforcement
 */

import { FastifyPluginAsync } from 'fastify';
import { validateBody, validateQuery } from '../middleware/validation';
import { createSwipeBodySchema, swipeCountQuerySchema } from '../validators';
import type { CreateSwipeInput } from '@letsmeet/shared';

const swipesRoute: FastifyPluginAsync = async (fastify) => {
  const { swipeService } = fastify.services;

  /**
   * POST /api/v1/swipes
   * Create a swipe action (returns match result)
   * Enforces daily limits for free users
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    preHandler: [validateBody(createSwipeBodySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { targetUserId, action } = request.body as { targetUserId: string; action: 'like' | 'pass' };

    const result = await swipeService.createSwipeAction({
      userId,
      targetUserId,
      action,
      swipedAt: new Date(),
    });

    return reply.send({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/v1/swipes/count
   * Get today's swipe count and limit
   */
  fastify.get('/count', {
    onRequest: [fastify.authenticate],
    preHandler: [validateQuery(swipeCountQuerySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;

    const stats = await swipeService.getSwipeStats(userId);

    return reply.send({
      success: true,
      data: stats,
    });
  });
};

export default swipesRoute;
