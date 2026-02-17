import { z } from 'zod';

/**
 * Swipe Validation Schemas
 */

export const createSwipeSchema = z.object({
  userId: z.string().min(1),
  targetUserId: z.string().min(1),
  action: z.enum(['like', 'pass', 'super_like']),
});

export type CreateSwipeSchema = z.infer<typeof createSwipeSchema>;
