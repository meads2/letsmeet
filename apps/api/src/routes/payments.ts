/**
 * Payment Routes
 *
 * Endpoints for Stripe payments and subscriptions
 */

import { FastifyPluginAsync } from 'fastify';
import Stripe from 'stripe';
import { createCheckoutSchema, SUBSCRIPTION_PLANS } from '@letsmeet/shared';
import { getProfileByUserId } from '@letsmeet/database';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const paymentsRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/payments/create-checkout
   * Create Stripe checkout session
   */
  fastify.post('/create-checkout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!;

    // Validate request body
    const validated = createCheckoutSchema.parse(request.body);

    // Get user's profile
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

    // Find the subscription plan
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === validated.tier);
    if (!plan) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Invalid subscription tier',
          code: 'INVALID_TIER',
        },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: profile.userId, // Use Clerk user ID as reference
      client_reference_id: userId,
      metadata: {
        userId,
        tier: validated.tier,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `LetsMeet ${plan.name} Subscription`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: validated.successUrl,
      cancel_url: validated.cancelUrl,
    });

    return reply.send({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
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

    // For now, return basic status based on isPremium flag
    // In production, you'd store Stripe subscription details in the database
    const tier = profile.isPremium ? 'premium' : 'free';
    const status = profile.isPremium ? 'active' : 'none';

    return reply.send({
      success: true,
      data: {
        tier,
        status,
      },
    });
  });
};

export default paymentsRoute;
