/**
 * Match Routes
 *
 * Endpoints for managing matches
 */

import { FastifyPluginAsync } from 'fastify';
import { getUserMatches, unmatchUsers } from '@letsmeet/database';

const matchesRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/matches
   * Get all matches for current user
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const matches = await getUserMatches(userId);

    return reply.send({
      success: true,
      data: matches,
    });
  });

  /**
   * DELETE /api/v1/matches/:matchId
   * Unmatch with a user
   */
  fastify.delete('/:matchId', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { matchId } = request.params as { matchId: string };

    await unmatchUsers(matchId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default matchesRoute;
