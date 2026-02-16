/**
 * Profile Routes
 *
 * Endpoints for managing user dating profiles
 */

import { FastifyPluginAsync } from 'fastify';
import {
  createProfileSchema,
  updateProfileSchema,
  type CreateProfileInput,
  type UpdateProfileInput,
} from '@letsmeet/shared';
import {
  getProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
} from '@letsmeet/database';

const profilesRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/profiles/me
   * Get current user's profile
   */
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

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
  }, async (request, reply) => {
    const userId = request.userId!;

    // Validate request body
    const validated = createProfileSchema.parse({
      ...(request.body as object),
      userId, // Override with authenticated user ID
    });

    // Check if profile already exists
    const existingProfile = await getProfileByUserId(userId);
    if (existingProfile) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Profile already exists',
          code: 'PROFILE_EXISTS',
        },
      });
    }

    const profile = await createProfile(validated as CreateProfileInput);

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
  }, async (request, reply) => {
    const userId = request.userId!;

    // Validate request body
    const validated = updateProfileSchema.parse(request.body);

    const profile = await updateProfile(userId, validated as UpdateProfileInput);

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

    await deleteProfile(userId);

    return reply.send({
      success: true,
      data: { success: true },
    });
  });
};

export default profilesRoute;
