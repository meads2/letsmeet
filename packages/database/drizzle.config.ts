/**
 * Drizzle Kit Configuration
 *
 * Configuration for Drizzle ORM migrations and schema management
 */

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from API .env file
dotenv.config({ path: resolve(__dirname, '../../apps/api/.env') });

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
