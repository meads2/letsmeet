/**
 * Match Routes
 *
 * Endpoints for managing matches
 * REFACTORED: Now uses MatchService with authorization checks
 */

import { FastifyPluginAsync } from 'fastify';
import { validateParams } from '../middleware/validation';
import { matchIdParamSchema } from '../validators';

const matchesRoute: FastifyPluginAsync = async (fastify) => {
  const { matchService } = fastify.services;

  /**
   * GET /api/v1/matches
   * Get all matches for current user
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const matches = await matchService.getUserMatchesWithProfiles(userId);

    return reply.send({
      success: true,
      data: matches,
    });
  });

  /**
   * DELETE /api/v1/matches/:matchId
   * Unmatch with a user
   * CRITICAL: Now includes authorization check - user must be match participant
   */
  fastify.delete('/:matchId', {
    onRequest: [fastify.authenticate],
    preHandler: [validateParams(matchIdParamSchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { matchId } = request.params as { matchId: string };

    await matchService.unmatch(matchId, userId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default matchesRoute;
