/**
 * Error Handler Plugin
 *
 * Centralized error handling for consistent API responses
 */

import { FastifyPluginAsync, FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError } from '../errors';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    // Log the error
    fastify.log.error({
      error,
      url: request.url,
      method: request.method,
    }, 'Request error');

    // Handle custom AppError instances
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Request validation failed',
          code: 'VALIDATION_ERROR',
          details: error.validation,
        },
      });
    }

    // Handle specific error codes
    const statusCode = error.statusCode || 500;

    // Don't expose internal errors in production
    const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

    return reply.code(statusCode).send({
      success: false,
      error: {
        message,
        code: error.code || 'INTERNAL_ERROR',
      },
    });
  });
};

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
});
