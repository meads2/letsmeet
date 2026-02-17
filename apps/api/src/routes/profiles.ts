/**
 * Profile Routes
 *
 * Endpoints for managing user dating profiles
 * REFACTORED: Now uses ProfileService and validation middleware
 */

import { FastifyPluginAsync } from 'fastify';
import { validateBody } from '../middleware/validation';
import { createProfileBodySchema, updateProfileBodySchema } from '../validators';
import type { CreateProfileInput, UpdateProfileInput } from '@letsmeet/shared';

const profilesRoute: FastifyPluginAsync = async (fastify) => {
  const { profileService } = fastify.services;

  /**
   * GET /api/v1/profiles/me
   * Get current user's profile
   */
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const profile = await profileService.getProfileOrThrow(userId);

    return reply.send({
      success: true,
      data: profile,
    });
  });

  /**
   * POST /api/v1/profiles
   * Create a new profile
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    preHandler: [validateBody(createProfileBodySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const body = request.body as CreateProfileInput;

    const profile = await profileService.createUserProfile(userId, body);

    return reply.code(201).send({
      success: true,
      data: profile,
    });
  });

  /**
   * PATCH /api/v1/profiles/me
   * Update current user's profile
   */
  fastify.patch('/me', {
    onRequest: [fastify.authenticate],
    preHandler: [validateBody(updateProfileBodySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const body = request.body as UpdateProfileInput;

    const profile = await profileService.updateUserProfile(userId, body);

    return reply.send({
      success: true,
      data: profile,
    });
  });

  /**
   * DELETE /api/v1/profiles/me
   * Delete current user's profile
   */
  fastify.delete('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    await profileService.deleteUserProfile(userId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default profilesRoute;
