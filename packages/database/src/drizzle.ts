/**
 * Drizzle ORM Client Configuration
 *
 * Type-safe database client using Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

/**
 * Database configuration
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

/**
 * Neon HTTP client
 */
const sql = neon(connectionString);

/**
 * Drizzle ORM instance with schema
 */
export const db = drizzle(sql, { schema });

/**
 * Export schema for use in queries
 */
export { schema };
