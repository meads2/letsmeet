import { z } from 'zod';

/**
 * Payment Validation Schemas
 */

export const createCheckoutSchema = z.object({
  tier: z.enum(['premium', 'premium_plus']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CreateCheckoutSchema = z.infer<typeof createCheckoutSchema>;
