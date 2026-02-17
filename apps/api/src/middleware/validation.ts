/**
 * Validation Middleware
 *
 * Provides preHandler middleware for validating request data using Zod schemas
 */

import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../errors';

/**
 * Validates request query parameters
 *
 * @example
 * fastify.get('/', {
 *   preHandler: [validateQuery(paginationSchema)],
 * }, async (request) => {
 *   const { limit, offset } = request.query; // Already validated & typed
 * });
 */
export function validateQuery<T extends ZodSchema>(
  schema: T
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new ValidationError(`Query validation failed: ${message}`);
      }
      throw error;
    }
  };
}

/**
 * Validates request route parameters
 *
 * @example
 * fastify.get('/:matchId', {
 *   preHandler: [validateParams(matchIdParamSchema)],
 * }, async (request) => {
 *   const { matchId } = request.params; // Already validated as UUID
 * });
 */
export function validateParams<T extends ZodSchema>(
  schema: T
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new ValidationError(`Parameter validation failed: ${message}`);
      }
      throw error;
    }
  };
}

/**
 * Validates request body
 *
 * @example
 * fastify.post('/', {
 *   preHandler: [validateBody(createSwipeBodySchema)],
 * }, async (request) => {
 *   const { targetUserId, action } = request.body; // Already validated
 * });
 */
export function validateBody<T extends ZodSchema>(
  schema: T
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new ValidationError(`Body validation failed: ${message}`);
      }
      throw error;
    }
  };
}
