/**
 * Database Client Configuration
 *
 * Neon Postgres connection setup and configuration
 */

import { neon, neonConfig } from '@neondatabase/serverless';

// Enable fetch for serverless environments
neonConfig.fetchConnectionCache = true;

/**
 * Database configuration
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

/**
 * Database client instance
 */
const sql = neon(connectionString);

/**
 * Execute a database query
 */
export const query = async <T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> => {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Execute a single row query (returns first row or null)
 */
export const queryOne = async <T = any>(
  queryText: string,
  params?: any[]
): Promise<T | null> => {
  const results = await query<T>(queryText, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Execute a transaction
 */
export const transaction = async <T = any>(
  callback: (sql: typeof query) => Promise<T>
): Promise<T> => {
  // Note: Neon Serverless doesn't support traditional transactions
  // For serverless, we use the callback pattern
  return await callback(query);
};

export default sql;
