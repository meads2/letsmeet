/**
 * Database Cleanup Script
 *
 * Removes test users from Clerk and the database
 */

import { createClerkClient } from '@clerk/backend';
import { query } from '../src/client';
import { config } from 'dotenv';

config({ path: '../../apps/api/.env' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const TEST_EMAILS = [
  'alice@test.com',
  'bob@test.com',
  'charlie@test.com',
  'diana@test.com',
  'evan@test.com',
];

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  for (const email of TEST_EMAILS) {
    try {
      // Get user from Clerk
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length > 0) {
        const user = users.data[0];

        // Delete from Clerk
        await clerkClient.users.deleteUser(user.id);
        console.log(`✓ Deleted Clerk user: ${email}`);

        // Delete from database (cascade will handle related records)
        await query(`DELETE FROM profiles WHERE user_id = $1`, [user.id]);
        console.log(`✓ Deleted profile for: ${email}`);
      }
    } catch (error) {
      console.error(`✗ Error cleaning up ${email}:`, error);
    }
  }

  console.log('\n✅ Cleanup complete!\n');
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  });
