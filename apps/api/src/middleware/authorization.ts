/**
 * Authorization Middleware
 *
 * Verifies resource ownership and access rights
 */

import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ForbiddenError, NotFoundError } from '../errors';

/**
 * Require that the authenticated user is a participant in a match
 *
 * @param getMatchId - Function to extract match ID from request
 *
 * @example
 * fastify.get('/messages/:matchId', {
 *   preHandler: [
 *     requireMatchParticipation((req) => req.params.matchId)
 *   ]
 * });
 */
export function requireMatchParticipation(
  getMatchId: (request: FastifyRequest) => string
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const matchId = getMatchId(request);
    const userId = (request as any).userId;

    if (!userId) {
      throw new ForbiddenError('Authentication required');
    }

    // Import here to avoid circular dependencies
    const { getMatchById } = await import('@letsmeet/database');

    const match = await getMatchById(matchId);

    if (!match) {
      throw new NotFoundError('Match');
    }

    // Verify user is one of the participants
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenError('You are not a participant in this match');
    }
  };
}

/**
 * Generic ownership verification factory
 *
 * @param resourceName - Name of the resource for error messages
 * @param getResource - Function to fetch the resource and return owner ID
 *
 * @example
 * const requireProfileOwnership = requireOwnership(
 *   'Profile',
 *   async (req) => {
 *     const profile = await getProfileByUserId(req.params.userId);
 *     return profile?.userId;
 *   }
 * );
 */
export function requireOwnership<T extends FastifyRequest>(
  resourceName: string,
  getResource: (request: T) => Promise<string | undefined>
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).userId;

    if (!userId) {
      throw new ForbiddenError('Authentication required');
    }

    const resourceOwnerId = await getResource(request as T);

    if (!resourceOwnerId) {
      throw new NotFoundError(resourceName);
    }

    if (resourceOwnerId !== userId) {
      throw new ForbiddenError(`You do not own this ${resourceName.toLowerCase()}`);
    }
  };
}
