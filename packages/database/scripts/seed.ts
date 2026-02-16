/**
 * Database Seed Script
 *
 * Creates test users in Clerk and matching profiles in the database
 */

import { createClerkClient } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import { query } from '../src/client';
import { config } from 'dotenv';

config({ path: '../../apps/api/.env' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Mock user data
const MOCK_USERS = [
  {
    email: 'alice@test.com',
    password: 'Test123!@#',
    firstName: 'Alice',
    lastName: 'Johnson',
    profile: {
      displayName: 'Alice',
      age: 26,
      gender: 'female' as const,
      lookingFor: ['male', 'non-binary'] as const,
      bio: 'Love hiking, coffee, and good conversations. Looking for someone genuine.',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      latitude: 37.7749,
      longitude: -122.4194,
      photos: [
        'https://i.pravatar.cc/400?img=1',
        'https://i.pravatar.cc/400?img=2',
      ],
      interests: ['hiking', 'coffee', 'travel', 'photography', 'yoga'],
      relationshipGoal: 'relationship' as const,
      maxDistance: 50,
      ageRangeMin: 24,
      ageRangeMax: 35,
    },
  },
  {
    email: 'bob@test.com',
    password: 'Test123!@#',
    firstName: 'Bob',
    lastName: 'Smith',
    profile: {
      displayName: 'Bob',
      age: 29,
      gender: 'male' as const,
      lookingFor: ['female'] as const,
      bio: 'Software engineer who loves rock climbing and craft beer.',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      latitude: 37.7849,
      longitude: -122.4094,
      photos: [
        'https://i.pravatar.cc/400?img=11',
        'https://i.pravatar.cc/400?img=12',
      ],
      interests: ['rock climbing', 'beer', 'coding', 'music', 'cooking'],
      relationshipGoal: 'relationship' as const,
      maxDistance: 50,
      ageRangeMin: 23,
      ageRangeMax: 32,
    },
  },
  {
    email: 'charlie@test.com',
    password: 'Test123!@#',
    firstName: 'Charlie',
    lastName: 'Davis',
    profile: {
      displayName: 'Charlie',
      age: 24,
      gender: 'non-binary' as const,
      lookingFor: ['female', 'non-binary', 'other'] as const,
      bio: 'Artist and musician. Into indie concerts and late-night diners.',
      city: 'Oakland',
      state: 'CA',
      country: 'USA',
      latitude: 37.8044,
      longitude: -122.2712,
      photos: [
        'https://i.pravatar.cc/400?img=21',
        'https://i.pravatar.cc/400?img=22',
      ],
      interests: ['music', 'art', 'concerts', 'food', 'vintage'],
      relationshipGoal: 'casual' as const,
      maxDistance: 30,
      ageRangeMin: 21,
      ageRangeMax: 30,
    },
  },
  {
    email: 'diana@test.com',
    password: 'Test123!@#',
    firstName: 'Diana',
    lastName: 'Lee',
    profile: {
      displayName: 'Diana',
      age: 27,
      gender: 'female' as const,
      lookingFor: ['male', 'female'] as const,
      bio: 'Medical student who loves running and trying new restaurants.',
      city: 'Berkeley',
      state: 'CA',
      country: 'USA',
      latitude: 37.8715,
      longitude: -122.2730,
      photos: [
        'https://i.pravatar.cc/400?img=31',
        'https://i.pravatar.cc/400?img=32',
      ],
      interests: ['running', 'food', 'medicine', 'travel', 'dogs'],
      relationshipGoal: 'relationship' as const,
      maxDistance: 40,
      ageRangeMin: 25,
      ageRangeMax: 35,
    },
  },
  {
    email: 'evan@test.com',
    password: 'Test123!@#',
    firstName: 'Evan',
    lastName: 'Martinez',
    profile: {
      displayName: 'Evan',
      age: 31,
      gender: 'male' as const,
      lookingFor: ['female'] as const,
      bio: 'Entrepreneur and fitness enthusiast. Looking for adventure.',
      city: 'San Jose',
      state: 'CA',
      country: 'USA',
      latitude: 37.3382,
      longitude: -121.8863,
      photos: [
        'https://i.pravatar.cc/400?img=41',
        'https://i.pravatar.cc/400?img=42',
      ],
      interests: ['fitness', 'business', 'travel', 'skiing', 'wine'],
      relationshipGoal: 'casual' as const,
      maxDistance: 60,
      ageRangeMin: 25,
      ageRangeMax: 35,
    },
  },
];

async function seedUsers() {
  console.log('🌱 Starting seed process...\n');

  const createdUsers = [];

  for (const mockUser of MOCK_USERS) {
    try {
      // 1. Create user in Clerk
      console.log(`Creating Clerk user: ${mockUser.email}`);
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [mockUser.email],
        password: mockUser.password,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        publicMetadata: {
          onboarded: true,
        },
      });

      console.log(`✓ Created Clerk user: ${clerkUser.id}`);

      // 2. Create profile in database
      console.log(`Creating profile for ${mockUser.profile.displayName}`);
      const profile = await query(
        `
        INSERT INTO profiles (
          user_id, display_name, age, gender, looking_for,
          bio, city, state, country, latitude, longitude,
          photos, interests, relationship_goal,
          max_distance, age_range_min, age_range_max,
          is_active, last_active, is_premium
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true, NOW(), false
        )
        RETURNING *
        `,
        [
          clerkUser.id,
          mockUser.profile.displayName,
          mockUser.profile.age,
          mockUser.profile.gender,
          mockUser.profile.lookingFor,
          mockUser.profile.bio,
          mockUser.profile.city,
          mockUser.profile.state,
          mockUser.profile.country,
          mockUser.profile.latitude,
          mockUser.profile.longitude,
          mockUser.profile.photos,
          mockUser.profile.interests,
          mockUser.profile.relationshipGoal,
          mockUser.profile.maxDistance,
          mockUser.profile.ageRangeMin,
          mockUser.profile.ageRangeMax,
        ]
      );

      console.log(`✓ Created profile: ${profile[0].id}\n`);

      createdUsers.push({
        clerkId: clerkUser.id,
        profileId: profile[0].id,
        email: mockUser.email,
        displayName: mockUser.profile.displayName,
      });
    } catch (error) {
      console.error(`✗ Error creating user ${mockUser.email}:`, error);
    }
  }

  // 3. Create sample swipes and matches
  console.log('\n🔄 Creating sample swipes and matches...\n');

  // Alice likes Bob, Bob likes Alice → Match!
  const alice = createdUsers.find((u) => u.email === 'alice@test.com');
  const bob = createdUsers.find((u) => u.email === 'bob@test.com');

  if (alice && bob) {
    // Alice swipes right on Bob
    await query(
      `INSERT INTO swipes (user_id, target_user_id, action) VALUES ($1, $2, 'like')`,
      [alice.clerkId, bob.clerkId]
    );

    // Bob swipes right on Alice (creates match)
    await query(
      `INSERT INTO swipes (user_id, target_user_id, action) VALUES ($1, $2, 'like')`,
      [bob.clerkId, alice.clerkId]
    );

    // Create match
    const match = await query(
      `
      INSERT INTO matches (user1_id, user2_id, matched_at)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [alice.clerkId < bob.clerkId ? alice.clerkId : bob.clerkId, alice.clerkId < bob.clerkId ? bob.clerkId : alice.clerkId]
    );

    console.log(`✓ Created match between Alice and Bob: ${match[0].id}`);

    // Add sample messages
    await query(
      `
      INSERT INTO messages (match_id, sender_id, receiver_id, content, type)
      VALUES ($1, $2, $3, $4, 'text')
      `,
      [match[0].id, alice.clerkId, bob.clerkId, 'Hey Bob! Love your profile 😊']
    );

    await query(
      `
      INSERT INTO messages (match_id, sender_id, receiver_id, content, type)
      VALUES ($1, $2, $3, $4, 'text')
      `,
      [match[0].id, bob.clerkId, alice.clerkId, 'Thanks Alice! Your hiking pics are amazing. Do you climb too?']
    );

    console.log(`✓ Created sample messages\n`);
  }

  // Diana likes Charlie
  const diana = createdUsers.find((u) => u.email === 'diana@test.com');
  const charlie = createdUsers.find((u) => u.email === 'charlie@test.com');

  if (diana && charlie) {
    await query(
      `INSERT INTO swipes (user_id, target_user_id, action) VALUES ($1, $2, 'like')`,
      [diana.clerkId, charlie.clerkId]
    );
    console.log(`✓ Diana liked Charlie (pending match)`);
  }

  // Evan passes on Alice
  const evan = createdUsers.find((u) => u.email === 'evan@test.com');
  if (evan && alice) {
    await query(
      `INSERT INTO swipes (user_id, target_user_id, action) VALUES ($1, $2, 'pass')`,
      [evan.clerkId, alice.clerkId]
    );
    console.log(`✓ Evan passed on Alice`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts created:');
  createdUsers.forEach((user) => {
    console.log(`  - ${user.displayName} (${user.email}) - Password: Test123!@#`);
  });
}

// Run seed
seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
