/**
 * Message Routes
 *
 * Endpoints for chat messages
 */

import { FastifyPluginAsync } from 'fastify';
import { createMessageSchema } from '@letsmeet/shared';
import {
  getMatchMessages,
  createMessage,
  markMatchMessagesAsRead,
} from '@letsmeet/database';

const messagesRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/messages/:matchId
   * Get messages for a match
   */
  fastify.get('/:matchId', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { matchId } = request.params as { matchId: string };
    const { limit = '50', offset = '0' } = request.query as { limit?: string; offset?: string };

    const messages = await getMatchMessages(
      matchId,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );

    return reply.send({
      success: true,
      data: messages,
    });
  });

  /**
   * POST /api/v1/messages
   * Send a new message
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    // Validate request body
    const validated = createMessageSchema.parse({
      ...(request.body as object),
      senderId: userId, // Override with authenticated user ID
    });

    const message = await createMessage(validated);

    return reply.code(201).send({
      success: true,
      data: message,
    });
  });

  /**
   * PATCH /api/v1/messages/:matchId/read
   * Mark all messages in a match as read
   */
  fastify.patch('/:matchId/read', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { matchId } = request.params as { matchId: string };

    await markMatchMessagesAsRead(matchId, userId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default messagesRoute;
