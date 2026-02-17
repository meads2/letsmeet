/**
 * Message Routes
 *
 * Endpoints for chat messages
 * REFACTORED: Now uses MessageService with authorization checks
 */

import { FastifyPluginAsync } from 'fastify';
import { validateParams, validateQuery, validateBody } from '../middleware/validation';
import { matchIdParamSchema, messageQuerySchema, sendMessageBodySchema } from '../validators';

const messagesRoute: FastifyPluginAsync = async (fastify) => {
  const { messageService } = fastify.services;

  /**
   * GET /api/v1/messages/:matchId
   * Get messages for a match
   * CRITICAL: Now includes authorization check - user must be match participant
   */
  fastify.get('/:matchId', {
    onRequest: [fastify.authenticate],
    preHandler: [
      validateParams(matchIdParamSchema),
      validateQuery(messageQuerySchema),
    ],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { matchId } = request.params as { matchId: string };
    const { limit, offset } = request.query as { limit: number; offset: number };

    const messages = await messageService.getMatchMessages(matchId, userId, limit, offset);

    return reply.send({
      success: true,
      data: messages,
    });
  });

  /**
   * POST /api/v1/messages
   * Send a new message
   * CRITICAL: Now includes authorization check - sender must be match participant
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    preHandler: [validateBody(sendMessageBodySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { matchId, content } = request.body as { matchId: string; content: string };

    const message = await messageService.sendMessage(
      { matchId, content },
      userId
    );

    return reply.code(201).send({
      success: true,
      data: message,
    });
  });

  /**
   * PATCH /api/v1/messages/:matchId/read
   * Mark all messages in a match as read
   * CRITICAL: Now includes authorization check - user must be match participant
   */
  fastify.patch('/:matchId/read', {
    onRequest: [fastify.authenticate],
    preHandler: [validateParams(matchIdParamSchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { matchId } = request.params as { matchId: string };

    await messageService.markMessagesRead(matchId, userId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default messagesRoute;
