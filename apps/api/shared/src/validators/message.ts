import { z } from 'zod';

/**
 * Message Validation Schemas
 */

export const createMessageSchema = z.object({
  matchId: z.string().min(1),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(1000),
  type: z.enum(['text', 'image', 'gif']),
  mediaUrl: z.string().url().optional(),
});

export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
