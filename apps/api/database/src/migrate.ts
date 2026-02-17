/**
 * Database Migration Script
 *
 * Runs Drizzle migrations against the database
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔄 Running migrations...');

  const sql = neon(connectionString);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed successfully!');
  process.exit(0);
};

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
