/**
 * Webhook Routes
 *
 * Endpoints for handling Stripe and Clerk webhooks
 */

import { FastifyPluginAsync } from 'fastify';
import Stripe from 'stripe';
import { Webhook as ClerkWebhook } from 'svix';
import { updatePremiumStatus, deleteProfile, createProfile } from '@letsmeet/database';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhooksRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/webhooks/stripe
   * Handle Stripe webhook events
   */
  fastify.post('/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Missing stripe-signature header',
          code: 'MISSING_SIGNATURE',
        },
      });
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      fastify.log.error('STRIPE_WEBHOOK_SECRET not configured');
      return reply.code(500).send({
        success: false,
        error: {
          message: 'Webhook secret not configured',
          code: 'CONFIG_ERROR',
        },
      });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        request.body as string | Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      fastify.log.warn({ error: err }, 'Invalid Stripe webhook signature');
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        },
      });
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;

          if (userId) {
            // Activate premium subscription
            await updatePremiumStatus(userId, true);
            fastify.log.info({ userId }, 'Premium subscription activated');
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;

          if (userId) {
            // Deactivate premium subscription
            await updatePremiumStatus(userId, false);
            fastify.log.info({ userId }, 'Premium subscription cancelled');
          }
          break;
        }

        default:
          fastify.log.info({ type: event.type }, 'Unhandled Stripe event type');
      }

      return reply.send({ success: true, received: true });
    } catch (error) {
      fastify.log.error({ error, event: event.type }, 'Error processing Stripe webhook');
      return reply.code(500).send({
        success: false,
        error: {
          message: 'Error processing webhook',
          code: 'PROCESSING_ERROR',
        },
      });
    }
  });

  /**
   * POST /api/v1/webhooks/clerk
   * Handle Clerk webhook events
   */
  fastify.post('/clerk', async (request, reply) => {
    if (!env.CLERK_WEBHOOK_SECRET) {
      fastify.log.error('CLERK_WEBHOOK_SECRET not configured');
      return reply.code(500).send({
        success: false,
        error: {
          message: 'Webhook secret not configured',
          code: 'CONFIG_ERROR',
        },
      });
    }

    const svixId = request.headers['svix-id'] as string;
    const svixTimestamp = request.headers['svix-timestamp'] as string;
    const svixSignature = request.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Missing Svix headers',
          code: 'MISSING_HEADERS',
        },
      });
    }

    let event: any;

    try {
      // Verify webhook signature
      const wh = new ClerkWebhook(env.CLERK_WEBHOOK_SECRET);
      event = wh.verify(JSON.stringify(request.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any;
    } catch (err) {
      fastify.log.warn({ error: err }, 'Invalid Clerk webhook signature');
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        },
      });
    }

    // Handle the event
    try {
      const eventType = event.type;

      switch (eventType) {
        case 'user.created': {
          const userId = event.data.id;
          fastify.log.info({ userId }, 'New user created in Clerk');
          // Profile will be created when user completes onboarding
          break;
        }

        case 'user.deleted': {
          const userId = event.data.id;
          // Delete user's profile
          await deleteProfile(userId);
          fastify.log.info({ userId }, 'User deleted from Clerk, profile removed');
          break;
        }

        default:
          fastify.log.info({ type: eventType }, 'Unhandled Clerk event type');
      }

      return reply.send({ success: true, received: true });
    } catch (error) {
      fastify.log.error({ error, event: event.type }, 'Error processing Clerk webhook');
      return reply.code(500).send({
        success: false,
        error: {
          message: 'Error processing webhook',
          code: 'PROCESSING_ERROR',
        },
      });
    }
  });
};

export default webhooksRoute;
