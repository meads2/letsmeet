/**
 * Webhook Routes
 *
 * Endpoints for handling Stripe and Clerk webhooks
 * REFACTORED: Now uses WebhookService for business logic
 */

import { FastifyPluginAsync } from 'fastify';
import Stripe from 'stripe';
import { Webhook as ClerkWebhook } from 'svix';
import { env } from '../config/env';
import { ValidationError } from '../errors';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const webhooksRoute: FastifyPluginAsync = async (fastify) => {
  const { webhookService } = fastify.services;

  /**
   * POST /webhooks/stripe
   * Handle Stripe webhook events
   * Verifies signature and delegates to WebhookService
   */
  fastify.post('/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      throw new ValidationError('Missing stripe-signature header');
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      fastify.log.error('STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
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
      throw new ValidationError('Invalid signature');
    }

    // Delegate to service for processing
    try {
      await webhookService.processStripeEvent(event);
      fastify.log.info({ type: event.type }, 'Stripe webhook processed');

      return reply.send({ success: true, received: true });
    } catch (error) {
      fastify.log.error({ error, event: event.type }, 'Error processing Stripe webhook');
      throw error;
    }
  });

  /**
   * POST /webhooks/clerk
   * Handle Clerk webhook events
   * Verifies signature and delegates to WebhookService
   */
  fastify.post('/clerk', async (request, reply) => {
    if (!env.CLERK_WEBHOOK_SECRET) {
      fastify.log.error('CLERK_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    const svixId = request.headers['svix-id'] as string;
    const svixTimestamp = request.headers['svix-timestamp'] as string;
    const svixSignature = request.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new ValidationError('Missing Svix headers');
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
      throw new ValidationError('Invalid signature');
    }

    // Delegate to service for processing
    try {
      await webhookService.processClerkEvent(event);
      fastify.log.info({ type: event.type }, 'Clerk webhook processed');

      return reply.send({ success: true, received: true });
    } catch (error) {
      fastify.log.error({ error, event: event.type }, 'Error processing Clerk webhook');
      throw error;
    }
  });
};

export default webhooksRoute;
