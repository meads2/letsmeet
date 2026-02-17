/**
 * Database Seed Script
 *
 * Creates 50 fake users in Clerk + DB with matches and messages for testing.
 * Uses Drizzle ORM for all database operations.
 *
 * Usage: cd packages/database && bun run seed
 */

import { createClerkClient } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../apps/api/.env') });

// Import after env is loaded
const { db, schema } = await import('../src/drizzle');
const { eq } = await import('drizzle-orm');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const SEED_PASSWORD = 'Test123!@#';
const USER_COUNT = 50;
const MATCHES_PER_USER = 6; // Each user will have at least this many matches
const MESSAGES_PER_MATCH_MIN = 4;
const MESSAGES_PER_MATCH_MAX = 14;
const CLERK_DELAY_MS = 350; // Rate limiting delay between Clerk API calls

// Bay Area locations for realistic proximity
const BAY_AREA_LOCATIONS = [
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  { city: 'Berkeley', state: 'CA', lat: 37.8715, lng: -122.273 },
  { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { city: 'Palo Alto', state: 'CA', lat: 37.4419, lng: -122.143 },
  { city: 'Sunnyvale', state: 'CA', lat: 37.3688, lng: -122.0363 },
  { city: 'Santa Clara', state: 'CA', lat: 37.3541, lng: -121.9552 },
  { city: 'Fremont', state: 'CA', lat: 37.5485, lng: -121.9886 },
  { city: 'Hayward', state: 'CA', lat: 37.6688, lng: -122.0808 },
  { city: 'Marin', state: 'CA', lat: 37.9735, lng: -122.5311 },
];

const GENDERS = ['male', 'female', 'non-binary'] as const;
const LOOKING_FOR_OPTIONS = ['male', 'female', 'everyone'] as const;
const RELATIONSHIP_GOALS = ['relationship', 'casual', 'friends', 'unsure'] as const;

const INTEREST_POOL = [
  'hiking', 'coffee', 'travel', 'photography', 'yoga', 'rock climbing',
  'craft beer', 'coding', 'music', 'cooking', 'art', 'concerts', 'vintage',
  'running', 'fitness', 'skiing', 'wine', 'dogs', 'cats', 'reading',
  'gaming', 'movies', 'dancing', 'surfing', 'cycling', 'tennis',
  'meditation', 'foodie', 'volunteering', 'startups', 'investing',
  'fashion', 'architecture', 'theater', 'poetry', 'kayaking', 'camping',
];

// Realistic conversation starters / messages for a dating app
const CONVERSATION_TEMPLATES = [
  (name: string) => `Hey ${name}! Your profile caught my eye 😊`,
  () => `I love your photos! Where was that one taken?`,
  (name: string) => `Hi ${name}! Seems like we have a lot in common.`,
  () => `That hiking photo is incredible! Do you have a favorite trail?`,
  () => `Hey! I noticed we're both into photography. What's your favorite subject?`,
  () => `Your taste in music looks amazing. Any recent concerts?`,
  () => `I'm obsessed with that travel photo. Where is that from?`,
  () => `Hey, I love that you're into [interest]. We should compare notes!`,
  (name: string) => `Hi ${name}! How's your week going?`,
  () => `Okay your dog is literally the cutest thing I've ever seen 🐕`,
];

const REPLIES = [
  () => `Haha thank you! I took that last summer in Colorado 🏔️`,
  (name: string) => `Hey ${name}! Doing great, thanks for asking! Yours?`,
  () => `Oh wow, yes! I'm super into that. Have you been doing it long?`,
  () => `Same! We should definitely grab coffee and talk more about it 😄`,
  () => `That photo is from my trip to Japan last year! Best trip ever.`,
  () => `Haha his name is Biscuit and he runs my life 😂`,
  () => `Not bad! Just got back from a run actually. Do you run?`,
  () => `I'm a huge fan of Patagonia. Have you been?`,
  () => `Yes! I've been doing it for about 3 years now. You?`,
  () => `We should definitely meet up and check it out together!`,
];

const FOLLOW_UPS = [
  () => `That sounds amazing! I've always wanted to go there.`,
  () => `Ha! Too relatable. My dog is the same way 😂`,
  () => `3 years, nice! I just started but I love it already.`,
  () => `Totally agree. Are you free this weekend?`,
  () => `OMG yes! I went last spring, it was incredible.`,
  () => `I'd love that! What area of the city are you in?`,
  () => `Wow small world! Do you know [place]? It's right there.`,
  () => `That's so cool! I need to get back into it.`,
  () => `Yes! Saturday works great for me 🙌`,
  () => `I'm in [neighborhood], pretty close to you!`,
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateFakeUser(index: number) {
  const gender = getRandomElement(GENDERS);
  const firstName = gender === 'male' ? faker.person.firstName('male') : faker.person.firstName('female');
  const lastName = faker.person.lastName();
  const location = getRandomElement(BAY_AREA_LOCATIONS);
  const age = faker.number.int({ min: 21, max: 42 });

  // Add slight random offset to coordinates for variety
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  const photoIndex = (index % 70) + 1; // pravatar.cc has ~70 images

  return {
    email: `seed-user-${index + 1}@seed.letsmeet.test`,
    password: SEED_PASSWORD,
    firstName,
    lastName,
    profile: {
      displayName: firstName,
      age,
      gender,
      lookingFor: getRandomElement(LOOKING_FOR_OPTIONS),
      bio: faker.lorem.sentences({ min: 1, max: 3 }),
      city: location.city,
      state: location.state,
      country: 'USA',
      latitude: location.lat + latOffset,
      longitude: location.lng + lngOffset,
      photos: [
        `https://i.pravatar.cc/400?img=${photoIndex}`,
        `https://i.pravatar.cc/400?img=${(photoIndex % 70) + 1}`,
        `https://i.pravatar.cc/400?img=${((photoIndex + 1) % 70) + 1}`,
      ],
      interests: getRandomSubset(INTEREST_POOL, 3, 7),
      relationshipGoal: getRandomElement(RELATIONSHIP_GOALS),
      maxDistance: faker.number.int({ min: 25, max: 100 }),
      ageRangeMin: Math.max(18, age - faker.number.int({ min: 3, max: 8 })),
      ageRangeMax: Math.min(55, age + faker.number.int({ min: 3, max: 10 })),
    },
  };
}

function generateMessages(
  matchId: string,
  user1: { id: string; displayName: string },
  user2: { id: string; displayName: string },
  count: number
) {
  const messages = [];
  let currentSender = Math.random() > 0.5 ? user1 : user2;
  let currentReceiver = currentSender === user1 ? user2 : user1;

  // Opening message
  const opener = getRandomElement(CONVERSATION_TEMPLATES);
  messages.push({
    matchId,
    senderId: currentSender.id,
    receiverId: currentReceiver.id,
    content: opener(currentReceiver.displayName),
    type: 'text' as const,
    createdAt: new Date(Date.now() - (count + 1) * 3600000), // hours ago
  });

  // Alternate senders for the rest
  for (let i = 1; i < count; i++) {
    // Swap sender/receiver
    [currentSender, currentReceiver] = [currentReceiver, currentSender];

    let content: string;
    if (i === 1) {
      content = getRandomElement(REPLIES)(currentReceiver.displayName);
    } else {
      content = getRandomElement(FOLLOW_UPS)();
    }

    messages.push({
      matchId,
      senderId: currentSender.id,
      receiverId: currentReceiver.id,
      content,
      type: 'text' as const,
      createdAt: new Date(Date.now() - (count - i) * 3600000),
    });
  }

  return messages;
}

type CreatedUser = {
  clerkId: string;
  dbUserId: string;
  email: string;
  displayName: string;
};

async function seedDatabase() {
  console.log('🌱 Starting comprehensive seed process...\n');
  console.log(`📊 Creating ${USER_COUNT} users, each with ≥${MATCHES_PER_USER} matches\n`);

  const createdUsers: CreatedUser[] = [];
  const failedUsers: string[] = [];

  // ─── Phase 1: Create Users ───────────────────────────────────────────────
  console.log('━━━ Phase 1: Creating Users ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (let i = 0; i < USER_COUNT; i++) {
    const userData = generateFakeUser(i);

    try {
      process.stdout.write(`[${i + 1}/${USER_COUNT}] Creating ${userData.email}... `);

      // 1a. Create in Clerk
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [userData.email],
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        publicMetadata: { onboarded: true, isSeeded: true },
      });

      // 1b. Insert into users table
      const [dbUser] = await db
        .insert(schema.users)
        .values({
          clerkId: clerkUser.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        })
        .returning();

      // 1c. Create profile
      await db.insert(schema.profiles).values({
        userId: dbUser.id,
        displayName: userData.profile.displayName,
        age: userData.profile.age,
        gender: userData.profile.gender,
        lookingFor: userData.profile.lookingFor,
        bio: userData.profile.bio,
        city: userData.profile.city,
        state: userData.profile.state,
        country: userData.profile.country,
        latitude: userData.profile.latitude,
        longitude: userData.profile.longitude,
        photos: userData.profile.photos,
        interests: userData.profile.interests,
        relationshipGoal: userData.profile.relationshipGoal,
        maxDistance: userData.profile.maxDistance,
        ageRangeMin: userData.profile.ageRangeMin,
        ageRangeMax: userData.profile.ageRangeMax,
        isActive: true,
        lastActive: new Date(),
        isPremium: false,
      });

      createdUsers.push({
        clerkId: clerkUser.id,
        dbUserId: dbUser.id,
        email: userData.email,
        displayName: userData.profile.displayName,
      });

      console.log(`✓ (Clerk: ${clerkUser.id.slice(0, 12)}...)`);
    } catch (error: any) {
      console.log(`✗ FAILED: ${error.message}`);
      failedUsers.push(userData.email);
    }

    // Rate limit delay for Clerk API
    if (i < USER_COUNT - 1) {
      await sleep(CLERK_DELAY_MS);
    }
  }

  console.log(`\n✅ Created ${createdUsers.length} users (${failedUsers.length} failed)\n`);

  if (createdUsers.length < MATCHES_PER_USER + 1) {
    console.error('❌ Not enough users created to generate matches. Exiting.');
    process.exit(1);
  }

  // ─── Phase 2: Create Matches ──────────────────────────────────────────────
  console.log('━━━ Phase 2: Creating Matches ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const createdMatches: Array<{
    matchId: string;
    user1: CreatedUser;
    user2: CreatedUser;
  }> = [];

  const matchedPairs = new Set<string>();

  // Round-robin: user[i] matches with user[i+1], [i+2], ..., [i+MATCHES_PER_USER]
  // This guarantees each user has exactly MATCHES_PER_USER matches (wrapping around)
  for (let i = 0; i < createdUsers.length; i++) {
    for (let offset = 1; offset <= MATCHES_PER_USER; offset++) {
      const j = (i + offset) % createdUsers.length;
      const userA = createdUsers[i];
      const userB = createdUsers[j];

      // Canonical pair key (lower index first) to avoid duplicates
      const pairKey = [userA.dbUserId, userB.dbUserId].sort().join(':');
      if (matchedPairs.has(pairKey)) continue;
      matchedPairs.add(pairKey);

      try {
        // Determine canonical user1/user2 ordering (lower UUID first)
        const [user1, user2] =
          userA.dbUserId < userB.dbUserId
            ? [userA, userB]
            : [userB, userA];

        // Create mutual swipes
        await db.insert(schema.swipes).values([
          {
            userId: userA.dbUserId,
            targetUserId: userB.dbUserId,
            action: 'like',
          },
          {
            userId: userB.dbUserId,
            targetUserId: userA.dbUserId,
            action: 'like',
          },
        ]);

        // Create match
        const matchedAt = new Date(
          Date.now() - faker.number.int({ min: 1, max: 30 }) * 86400000
        );

        const [match] = await db
          .insert(schema.matches)
          .values({
            user1Id: user1.dbUserId,
            user2Id: user2.dbUserId,
            matchedAt,
            isActive: true,
          })
          .returning();

        createdMatches.push({ matchId: match.id, user1, user2 });
      } catch (error: any) {
        console.error(`  ✗ Match ${userA.email} ↔ ${userB.email} failed: ${error.message}`);
      }
    }
  }

  console.log(`✅ Created ${createdMatches.length} matches\n`);

  // ─── Phase 3: Create Messages ─────────────────────────────────────────────
  console.log('━━━ Phase 3: Creating Messages ━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalMessages = 0;

  for (const { matchId, user1, user2 } of createdMatches) {
    const messageCount = faker.number.int({
      min: MESSAGES_PER_MATCH_MIN,
      max: MESSAGES_PER_MATCH_MAX,
    });

    const messages = generateMessages(
      matchId,
      { id: user1.dbUserId, displayName: user1.displayName },
      { id: user2.dbUserId, displayName: user2.displayName },
      messageCount
    );

    try {
      await db.insert(schema.messages).values(messages);

      // Update match's last_message_at
      const lastMessage = messages[messages.length - 1];
      await db
        .update(schema.matches)
        .set({ lastMessageAt: lastMessage.createdAt })
        .where(eq(schema.matches.id, matchId));

      totalMessages += messages.length;
    } catch (error: any) {
      console.error(`  ✗ Messages for match ${matchId} failed: ${error.message}`);
    }
  }

  console.log(`✅ Created ${totalMessages} messages across ${createdMatches.length} matches\n`);

  // ─── Phase 4: Write Manifest ──────────────────────────────────────────────
  console.log('━━━ Phase 4: Writing Seed Manifest ━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const manifest = {
    seededAt: new Date().toISOString(),
    password: SEED_PASSWORD,
    userCount: createdUsers.length,
    matchCount: createdMatches.length,
    messageCount: totalMessages,
    users: createdUsers.map((u) => ({
      email: u.email,
      clerkId: u.clerkId,
      dbUserId: u.dbUserId,
      displayName: u.displayName,
    })),
  };

  const manifestPath = resolve(__dirname, '../seed-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📄 Manifest written to: ${manifestPath}\n`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    SEED COMPLETE ✅                      ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Users created:    ${String(createdUsers.length).padEnd(36)}║`);
  console.log(`║  Matches created:  ${String(createdMatches.length).padEnd(36)}║`);
  console.log(`║  Messages created: ${String(totalMessages).padEnd(36)}║`);
  console.log(`║  Password:         ${SEED_PASSWORD.padEnd(36)}║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Sample test accounts:                                   ║');
  createdUsers.slice(0, 3).forEach((u) => {
    const line = `  ${u.email}`;
    console.log(`║  ${line.padEnd(56)}║`);
  });
  console.log('╚══════════════════════════════════════════════════════════╝');

  if (failedUsers.length > 0) {
    console.log(`\n⚠️  Failed users (${failedUsers.length}):`);
    failedUsers.forEach((e) => console.log(`   - ${e}`));
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  });
