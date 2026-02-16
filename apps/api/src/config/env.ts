/**
 * Environment Configuration
 *
 * Validates all required environment variables using Zod
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().min(1),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  ALLOWED_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and export environment variables
 */
export const env = envSchema.parse(process.env);

/**
 * Get allowed CORS origins
 */
export const getAllowedOrigins = (): string[] => {
  if (!env.ALLOWED_ORIGINS) {
    return ['http://localhost:8081'];
  }
  return env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
};
