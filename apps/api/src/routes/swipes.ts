/**
 * Swipe Routes
 *
 * Endpoints for swiping and match detection
 */

import { FastifyPluginAsync } from 'fastify';
import { createSwipeSchema, getDailyLikesLimit } from '@letsmeet/shared';
import {
  createSwipe,
  getTodaySwipeCount,
  getProfileByUserId,
} from '@letsmeet/database';

const swipesRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/swipes
   * Create a swipe action (returns match result)
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    // Validate request body
    const validated = createSwipeSchema.parse({
      ...(request.body as object),
      userId, // Override with authenticated user ID
    });

    // Get user's profile to check premium status
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return reply.code(404).send({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
      });
    }

    // Check daily swipe limit for non-premium users
    if (!profile.isPremium) {
      const todayCount = await getTodaySwipeCount(userId);
      const tier = profile.isPremium ? 'premium' : 'free';
      const limit = getDailyLikesLimit(tier);

      if (typeof limit === 'number' && todayCount >= limit) {
        return reply.code(429).send({
          success: false,
          error: {
            message: `Daily swipe limit reached (${limit})`,
            code: 'LIMIT_REACHED',
          },
        });
      }
    }

    // Create swipe and check for match
    const result = await createSwipe(validated);

    return reply.send({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/v1/swipes/count
   * Get today's swipe count
   */
  fastify.get('/count', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const profile = await getProfileByUserId(userId);
    const tier = profile?.isPremium ? 'premium' : 'free';
    const limit = getDailyLikesLimit(tier);
    const count = await getTodaySwipeCount(userId);

    return reply.send({
      success: true,
      data: {
        count,
        limit,
      },
    });
  });
};

export default swipesRoute;
