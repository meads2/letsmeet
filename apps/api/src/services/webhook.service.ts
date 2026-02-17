/**
 * Webhook Service
 *
 * Business logic for processing webhook events from external services
 */

import Stripe from 'stripe';
import { createUser, updateUser, deleteUser } from '@letsmeet/database';
import { PaymentService } from './payment.service';

interface ClerkUserEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
}

export class WebhookService {
  constructor(private paymentService: PaymentService) {}

  /**
   * Process Stripe webhook event
   */
  async processStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        // Ignore unhandled events
        break;
    }
  }

  /**
   * Process Clerk webhook event
   */
  async processClerkEvent(event: ClerkUserEvent): Promise<void> {
    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event.data);
        break;

      case 'user.updated':
        await this.handleUserUpdated(event.data);
        break;

      case 'user.deleted':
        await this.handleUserDeleted(event.data);
        break;

      default:
        // Ignore unhandled events
        break;
    }
  }

  // ============================================================================
  // Stripe Event Handlers
  // ============================================================================

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    await this.paymentService.handleCheckoutComplete(session);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // If subscription is active, ensure user is premium
    if (subscription.status === 'active') {
      const userId = subscription.metadata?.userId;
      if (!userId) return;

      // This is handled by checkout.session.completed for new subscriptions
      // For renewals, the user should already be premium
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.paymentService.handleSubscriptionCancelled(subscription);
  }

  // ============================================================================
  // Clerk Event Handlers
  // ============================================================================

  private async handleUserCreated(data: ClerkUserEvent['data']): Promise<void> {
    const email = data.email_addresses?.[0]?.email_address || '';

    await createUser({
      clerkId: data.id,
      email,
    });
  }

  private async handleUserUpdated(data: ClerkUserEvent['data']): Promise<void> {
    const email = data.email_addresses?.[0]?.email_address;

    if (email) {
      await updateUser(data.id, { email });
    }
  }

  private async handleUserDeleted(data: ClerkUserEvent['data']): Promise<void> {
    await deleteUser(data.id);
  }
}
