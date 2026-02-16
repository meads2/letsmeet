/**
 * Authentication Plugin
 *
 * Clerk JWT verification for protected routes
 */

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { env } from '../config/env';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId?: string;
  }
}

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
});

const authPlugin: FastifyPluginAsync = async (fastify) => {
  /**
   * Authentication decorator
   * Verifies Clerk JWT tokens and attaches userId to request
   */
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: {
            message: 'Missing or invalid authorization header',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the JWT token with Clerk
      try {
        const sessionClaims = await verifyToken(token, {
          secretKey: env.CLERK_SECRET_KEY,
        });

        if (!sessionClaims.sub) {
          return reply.code(401).send({
            success: false,
            error: {
              message: 'Invalid token: missing user ID',
              code: 'UNAUTHORIZED',
            },
          });
        }

        // Attach userId to request
        request.userId = sessionClaims.sub;
      } catch (verifyError) {
        fastify.log.warn({ error: verifyError }, 'Token verification failed');
        return reply.code(401).send({
          success: false,
          error: {
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED',
          },
        });
      }
    } catch (error) {
      fastify.log.error({ error }, 'Authentication error');
      return reply.code(500).send({
        success: false,
        error: {
          message: 'Internal server error during authentication',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  });
};

export default fp(authPlugin, {
  name: 'auth',
});
