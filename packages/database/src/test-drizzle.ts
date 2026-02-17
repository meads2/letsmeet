/**
 * Drizzle ORM Test Script
 *
 * Verifies Drizzle setup is working correctly
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
dotenv.config({ path: resolve(__dirname, '../../../apps/api/.env') });

async function testDrizzle() {
  // Import after env is loaded
  const { db, schema } = await import('./drizzle');
  const { sql } = await import('drizzle-orm');

  console.log('🧪 Testing Drizzle ORM setup...\n');

  try {
    // Test 1: Check connection
    console.log('1️⃣  Testing database connection...');
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Connected!');

    // Test 2: Check tables exist by counting rows
    console.log('\n2️⃣  Checking tables exist...');

    // Test 3: Count rows in each table
    console.log('\n3️⃣  Counting rows...');

    const userCount = await db.$count(schema.users);
    console.log(`   Users: ${userCount} rows`);

    const profileCount = await db.$count(schema.profiles);
    console.log(`   Profiles: ${profileCount} rows`);

    const swipeCount = await db.$count(schema.swipes);
    console.log(`   Swipes: ${swipeCount} rows`);

    const matchCount = await db.$count(schema.matches);
    console.log(`   Matches: ${matchCount} rows`);

    const messageCount = await db.$count(schema.messages);
    console.log(`   Messages: ${messageCount} rows`);

    console.log('\n✅ All tests passed! Drizzle ORM is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testDrizzle();
