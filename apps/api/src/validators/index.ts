/**
 * Request Validation Schemas
 *
 * Zod schemas for validating query params, route params, and request bodies
 */

import { z } from 'zod';

/**
 * Pagination query params schema
 * Used by: feed, messages, matches endpoints
 */
export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .default('50')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, {
      message: 'Offset must be non-negative',
    }),
});

/**
 * Match ID route parameter schema
 * Used by: messages, matches endpoints
 */
export const matchIdParamSchema = z.object({
  matchId: z.string().uuid({
    message: 'Invalid match ID format',
  }),
});

/**
 * Feed query parameters schema
 * Includes pagination + feed-specific filters
 */
export const feedQuerySchema = paginationSchema.extend({
  // Future: Add filtering options (distance, age range, etc.)
});

/**
 * Messages query parameters schema
 * Includes pagination for message lists
 */
export const messageQuerySchema = paginationSchema;

/**
 * Swipe count query schema
 */
export const swipeCountQuerySchema = z.object({
  // Currently no query params, but keeping for consistency
});

/**
 * Create swipe body schema
 */
export const createSwipeBodySchema = z.object({
  targetUserId: z.string().uuid({
    message: 'Invalid target user ID format',
  }),
  action: z.enum(['like', 'pass'], {
    errorMap: () => ({ message: 'Action must be either "like" or "pass"' }),
  }),
});

/**
 * Send message body schema
 */
export const sendMessageBodySchema = z.object({
  matchId: z.string().uuid({
    message: 'Invalid match ID format',
  }),
  content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message too long'),
});

/**
 * Create profile body schema
 */
export const createProfileBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  gender: z.enum(['male', 'female', 'non_binary', 'other']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().optional(),
  }),
  preferences: z.object({
    minAge: z.number().int().min(18).max(100),
    maxAge: z.number().int().min(18).max(100),
    maxDistance: z.number().int().min(1).max(500), // km
    genderPreference: z.array(z.enum(['male', 'female', 'non_binary', 'other'])),
  }),
  photos: z.array(z.string().url()).min(1, 'At least one photo is required').max(6),
});

/**
 * Update profile body schema (partial of create)
 */
export const updateProfileBodySchema = createProfileBodySchema.partial();

/**
 * Create checkout session body schema
 */
export const createCheckoutBodySchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

/**
 * Type exports for TypeScript
 */
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type MatchIdParam = z.infer<typeof matchIdParamSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>;
export type CreateSwipeBody = z.infer<typeof createSwipeBodySchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type CreateCheckoutBody = z.infer<typeof createCheckoutBodySchema>;
