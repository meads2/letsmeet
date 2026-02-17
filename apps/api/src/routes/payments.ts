/**
 * Payment Routes
 *
 * Endpoints for Stripe payments and subscriptions
 * REFACTORED: Now uses PaymentService
 */

import { FastifyPluginAsync } from 'fastify';
import { validateBody } from '../middleware/validation';
import { createCheckoutBodySchema } from '../validators';

const paymentsRoute: FastifyPluginAsync = async (fastify) => {
  const { paymentService } = fastify.services;

  /**
   * POST /api/v1/payments/create-checkout
   * Create Stripe checkout session for subscription
   */
  fastify.post('/create-checkout', {
    onRequest: [fastify.authenticate],
    preHandler: [validateBody(createCheckoutBodySchema)],
  }, async (request, reply) => {
    const userId = request.userId!;
    const { priceId, successUrl, cancelUrl } = request.body as {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
    };

    const result = await paymentService.createCheckoutSession({
      userId,
      priceId,
      successUrl,
      cancelUrl,
    });

    return reply.send({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/v1/payments/subscription
   * Get current subscription status
   */
  fastify.get('/subscription', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    const status = await paymentService.getSubscriptionStatus(userId);

    return reply.send({
      success: true,
      data: status,
    });
  });
};

export default paymentsRoute;
