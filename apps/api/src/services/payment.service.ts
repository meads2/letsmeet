/**
 * Payment Service
 *
 * Business logic for Stripe payment processing
 */

import Stripe from 'stripe';
import { env } from '../config/env';
import { ProfileService } from './profile.service';
import { NotFoundError } from '../errors';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

interface CreateCheckoutSessionInput {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface SubscriptionStatus {
  isPremium: boolean;
  subscription: Stripe.Subscription | null;
}

export class PaymentService {
  constructor(private profileService: ProfileService) {}

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ url: string }> {
    // Ensure user has a profile
    const profile = await this.profileService.getProfileOrThrow(input.userId);

    // Get or create Stripe customer
    let customerId = profile.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: input.userId,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await this.profileService.updateUserProfile(input.userId, {
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return { url: session.url };
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const profile = await this.profileService.getProfileOrThrow(userId);

    // If no Stripe customer ID, user has never subscribed
    if (!profile.stripeCustomerId) {
      return {
        isPremium: false,
        subscription: null,
      };
    }

    // Get active subscriptions for customer
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    const activeSubscription = subscriptions.data[0] || null;

    return {
      isPremium: profile.isPremium || false,
      subscription: activeSubscription,
    };
  }

  /**
   * Handle successful checkout
   * Called by webhook service
   */
  async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;

    if (!userId) {
      throw new Error('Missing userId in checkout session metadata');
    }

    // Update user to premium status
    await this.profileService.updateUserProfile(userId, {
      isPremium: true,
      stripeCustomerId: session.customer as string,
    });
  }

  /**
   * Handle subscription cancellation
   * Called by webhook service
   */
  async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      // Try to find user by customer ID
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (customer.deleted) {
        throw new Error('Customer was deleted');
      }
      const customerUserId = customer.metadata?.userId;
      if (!customerUserId) {
        throw new Error('Missing userId in subscription metadata');
      }

      // Update user to free status
      await this.profileService.updateUserProfile(customerUserId, {
        isPremium: false,
      });
      return;
    }

    // Update user to free status
    await this.profileService.updateUserProfile(userId, {
      isPremium: false,
    });
  }
}
