/**
 * Service Container
 *
 * Initializes and exports all service instances with dependency injection
 */

import { ProfileService } from './profile.service';
import { MessageService } from './message.service';
import { SwipeService } from './swipe.service';
import { MatchService } from './match.service';
import { FeedService } from './feed.service';
import { PaymentService } from './payment.service';
import { WebhookService } from './webhook.service';

// Re-export service classes for testing
export { ProfileService } from './profile.service';
export { MessageService } from './message.service';
export { SwipeService } from './swipe.service';
export { MatchService } from './match.service';
export { FeedService } from './feed.service';
export { PaymentService } from './payment.service';
export { WebhookService } from './webhook.service';

/**
 * Service factory - creates instances with Redis client from Fastify
 * This allows services to use Redis without circular dependencies
 */
export function createServices(redis: any) {
  // Create base services
  const profileService = new ProfileService();
  const messageService = new MessageService();
  const matchService = new MatchService(redis);
  const feedService = new FeedService(redis);
  const swipeService = new SwipeService(profileService, redis);
  const paymentService = new PaymentService(profileService);
  const webhookService = new WebhookService(paymentService);

  return {
    profileService,
    messageService,
    swipeService,
    matchService,
    feedService,
    paymentService,
    webhookService,
  };
}

/**
 * Service container type
 */
export type Services = ReturnType<typeof createServices>;

/**
 * Extend Fastify instance to include services
 */
declare module 'fastify' {
  interface FastifyInstance {
    services: Services;
  }
}
