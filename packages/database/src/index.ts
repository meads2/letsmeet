/**
 * @letsmeet/database
 *
 * Database client and query functions for Neon Postgres
 */

// Export legacy raw SQL client (for backward compatibility)
export * from './client';

// Export all legacy query functions (for backward compatibility)
export * from './queries';

// Export Drizzle ORM client and schema (NEW - type-safe queries)
export { db, schema } from './drizzle';
export * from './schema';
