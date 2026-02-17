/**
 * Database Cleanup Script
 *
 * Removes seeded test users from Clerk and the database.
 * Reads from seed-manifest.json if available, otherwise falls back to
 * querying Clerk for users with the seed email pattern.
 *
 * Usage: cd apps/api/database && bun run cleanup
 */

import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

const { db, schema } = await import('../src/drizzle');
const { eq } = await import('drizzle-orm');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const CLERK_DELAY_MS = 200;
const SEED_EMAIL_PATTERN = '@seed.letsmeet.test';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanup() {
  console.log('🧹 Cleaning up seeded test data...\n');

  // Try to load manifest for exact user list
  const manifestPath = resolve(__dirname, '../seed-manifest.json');
  let emailsToClean: string[] = [];

  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    emailsToClean = manifest.users.map((u: { email: string }) => u.email);
    console.log(`📄 Found manifest with ${emailsToClean.length} users\n`);
  } else {
    console.log('📄 No manifest found, querying Clerk for seeded users...\n');

    // Fall back to querying Clerk - list users and filter by email pattern
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await clerkClient.users.getUserList({ limit, offset });
      const seededUsers = response.data.filter((u) =>
        u.emailAddresses.some((e) => e.emailAddress.includes(SEED_EMAIL_PATTERN))
      );
      emailsToClean.push(
        ...seededUsers.flatMap((u) =>
          u.emailAddresses.map((e) => e.emailAddress)
        )
      );
      hasMore = response.data.length === limit;
      offset += limit;
    }

    console.log(`Found ${emailsToClean.length} seeded users in Clerk\n`);
  }

  if (emailsToClean.length === 0) {
    console.log('✅ No seeded users found. Nothing to clean up.');
    return;
  }

  let deletedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < emailsToClean.length; i++) {
    const email = emailsToClean[i];
    process.stdout.write(`[${i + 1}/${emailsToClean.length}] Deleting ${email}... `);

    try {
      // Get Clerk user by email
      const clerkResult = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (clerkResult.data.length === 0) {
        console.log('(not in Clerk, skipping)');
        continue;
      }

      const clerkUser = clerkResult.data[0];

      // Delete from DB first (cascade handles related records via clerkId→users→everything)
      await db.delete(schema.users).where(eq(schema.users.clerkId, clerkUser.id));

      // Delete from Clerk
      await clerkClient.users.deleteUser(clerkUser.id);

      console.log('✓');
      deletedCount++;
    } catch (error: any) {
      console.log(`✗ ${error.message}`);
      failedCount++;
    }

    if (i < emailsToClean.length - 1) {
      await sleep(CLERK_DELAY_MS);
    }
  }

  // Remove manifest file if it exists
  if (existsSync(manifestPath)) {
    const { unlinkSync } = await import('fs');
    unlinkSync(manifestPath);
    console.log('\n📄 Manifest file removed');
  }

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║         CLEANUP COMPLETE ✅           ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Deleted:  ${String(deletedCount).padEnd(26)}║`);
  console.log(`║  Failed:   ${String(failedCount).padEnd(26)}║`);
  console.log(`╚══════════════════════════════════════╝`);
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Cleanup failed:', err);
    process.exit(1);
  });
