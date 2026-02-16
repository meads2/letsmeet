/**
 * Routes Registration
 *
 * Registers all API route modules
 */

import { FastifyInstance } from 'fastify';
import profilesRoute from './profiles';
import swipesRoute from './swipes';
import matchesRoute from './matches';
import messagesRoute from './messages';
import feedRoute from './feed';
import paymentsRoute from './payments';
import webhooksRoute from './webhooks';

export async function registerRoutes(fastify: FastifyInstance) {
  // API v1 routes
  const apiPrefix = '/api/v1';

  // Register all routes with prefix
  await fastify.register(profilesRoute, { prefix: `${apiPrefix}/profiles` });
  await fastify.register(swipesRoute, { prefix: `${apiPrefix}/swipes` });
  await fastify.register(matchesRoute, { prefix: `${apiPrefix}/matches` });
  await fastify.register(messagesRoute, { prefix: `${apiPrefix}/messages` });
  await fastify.register(feedRoute, { prefix: `${apiPrefix}/feed` });
  await fastify.register(paymentsRoute, { prefix: `${apiPrefix}/payments` });
  await fastify.register(webhooksRoute, { prefix: `${apiPrefix}/webhooks` });
}
