# Drizzle ORM Guide

## Overview

The LetsMeet database now uses **Drizzle ORM** for type-safe, efficient database queries with Neon Postgres.

## Why Drizzle?

✅ **Type Safety** - Full TypeScript support with autocomplete
✅ **Performance** - Generates optimal SQL queries
✅ **Migrations** - Automatic migration generation from schema
✅ **SQL-like** - Familiar syntax for SQL developers
✅ **Serverless** - Works perfectly with Neon Postgres

---

## Database Structure

### Tables

1. **users** - Authentication data from Clerk
2. **profiles** - User dating profiles with preferences
3. **swipes** - Swipe actions (like, pass, super_like)
4. **matches** - Matched users (mutual likes)
5. **messages** - Chat messages between matches

---

## Usage Examples

### Import the Client

```typescript
import { db, schema } from '@letsmeet/database';
import { eq, and, desc } from 'drizzle-orm';
```

### Select Queries

**Get user by ID:**
```typescript
const user = await db.query.users.findFirst({
  where: eq(schema.users.id, userId),
});
```

**Get profile with user data:**
```typescript
const profile = await db.query.profiles.findFirst({
  where: eq(schema.profiles.userId, userId),
  with: {
    user: true, // Join with users table
  },
});
```

**Get all matches for a user:**
```typescript
const matches = await db.query.matches.findMany({
  where: or(
    eq(schema.matches.user1Id, userId),
    eq(schema.matches.user2Id, userId)
  ),
  with: {
    user1: { with: { profile: true } },
    user2: { with: { profile: true } },
  },
});
```

### Insert Queries

**Create a user:**
```typescript
const [newUser] = await db
  .insert(schema.users)
  .values({
    clerkId: 'clerk_xxx',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  })
  .returning();
```

**Create a profile:**
```typescript
const [profile] = await db
  .insert(schema.profiles)
  .values({
    userId: user.id,
    displayName: 'John',
    age: 25,
    gender: 'male',
    lookingFor: 'female',
    latitude: 37.7749,
    longitude: -122.4194,
    photos: ['photo1.jpg', 'photo2.jpg'],
    maxDistance: 50,
    ageRangeMin: 21,
    ageRangeMax: 35,
  })
  .returning();
```

**Create a swipe:**
```typescript
const [swipe] = await db
  .insert(schema.swipes)
  .values({
    userId: currentUserId,
    targetUserId: targetUserId,
    action: 'like',
  })
  .returning();
```

### Update Queries

**Update profile:**
```typescript
const [updated] = await db
  .update(schema.profiles)
  .set({
    bio: 'Updated bio',
    isPremium: true,
    updatedAt: new Date(),
  })
  .where(eq(schema.profiles.userId, userId))
  .returning();
```

**Mark message as read:**
```typescript
await db
  .update(schema.messages)
  .set({ readAt: new Date() })
  .where(
    and(
      eq(schema.messages.matchId, matchId),
      eq(schema.messages.receiverId, userId)
    )
  );
```

### Delete Queries

**Delete a match (soft delete by setting inactive):**
```typescript
await db
  .update(schema.matches)
  .set({ isActive: false, updatedAt: new Date() })
  .where(eq(schema.matches.id, matchId));
```

**Delete a user (cascade delete):**
```typescript
await db
  .delete(schema.users)
  .where(eq(schema.users.id, userId));
// This will cascade delete: profile, swipes, matches, messages
```

### Complex Queries

**Get messages with sender info:**
```typescript
const messages = await db.query.messages.findMany({
  where: eq(schema.messages.matchId, matchId),
  with: {
    sender: {
      with: { profile: true },
    },
  },
  orderBy: desc(schema.messages.createdAt),
  limit: 50,
});
```

**Find mutual likes (match detection):**
```typescript
import { and, eq, inArray } from 'drizzle-orm';

// Check if target user liked current user back
const reciprocalSwipe = await db.query.swipes.findFirst({
  where: and(
    eq(schema.swipes.userId, targetUserId),
    eq(schema.swipes.targetUserId, currentUserId),
    inArray(schema.swipes.action, ['like', 'super_like'])
  ),
});

if (reciprocalSwipe) {
  // Create match!
  const [match] = await db
    .insert(schema.matches)
    .values({
      user1Id: Math.min(currentUserId, targetUserId),
      user2Id: Math.max(currentUserId, targetUserId),
      matchedAt: new Date(),
    })
    .returning();
}
```

**Get today's swipe count:**
```typescript
import { count, and, gte } from 'drizzle-orm';

const today = new Date();
today.setHours(0, 0, 0, 0);

const [{ count: swipeCount }] = await db
  .select({ count: count() })
  .from(schema.swipes)
  .where(
    and(
      eq(schema.swipes.userId, userId),
      gte(schema.swipes.createdAt, today)
    )
  );
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  // Create user
  const [user] = await tx
    .insert(schema.users)
    .values({ clerkId, email })
    .returning();

  // Create profile
  const [profile] = await tx
    .insert(schema.profiles)
    .values({ userId: user.id, ...profileData })
    .returning();

  return { user, profile };
});
```

---

## Migration Commands

### Generate Migration
Creates SQL migration files from schema changes:
```bash
cd packages/database
bun run db:generate
```

### Run Migrations
Applies migrations to database:
```bash
bun run db:migrate
```

### Push Schema (Dev Only)
Directly pushes schema to database without migrations:
```bash
bun run db:push
```

### Drizzle Studio
Visual database browser:
```bash
bun run db:studio
```

---

## Schema Files

```
packages/database/src/schema/
├── users.ts       - Users table
├── profiles.ts    - Profiles table
├── swipes.ts      - Swipes table
├── matches.ts     - Matches table
├── messages.ts    - Messages table
└── index.ts       - Export all schemas
```

### Modifying Schema

1. **Edit schema file** (e.g., `profiles.ts`)
2. **Generate migration**: `bun run db:generate`
3. **Review migration** in `drizzle/` folder
4. **Apply migration**: `bun run db:migrate`

---

## Type Safety

### Inferred Types

```typescript
import { User, NewUser, Profile, NewProfile } from '@letsmeet/database';

// Select type (includes id, createdAt, etc.)
const user: User = await db.query.users.findFirst(...);

// Insert type (without id, createdAt, etc.)
const newUserData: NewUser = {
  clerkId: 'xxx',
  email: 'test@example.com',
};
```

### Custom Types

```typescript
type ProfileWithUser = typeof schema.profiles.$inferSelect & {
  user: typeof schema.users.$inferSelect;
};
```

---

## Relations

Relations are defined in the schema and can be used with `.with()`:

```typescript
// Get profile with user
const profile = await db.query.profiles.findFirst({
  where: eq(schema.profiles.userId, userId),
  with: {
    user: true, // Automatically joins users table
  },
});
```

To add relations, update schema files:

```typescript
import { relations } from 'drizzle-orm';

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
```

---

## Best Practices

### 1. Use Query Builder for Complex Queries
```typescript
const matches = await db
  .select()
  .from(schema.matches)
  .where(eq(schema.matches.isActive, true))
  .orderBy(desc(schema.matches.matchedAt))
  .limit(20);
```

### 2. Use Prepared Statements for Repeated Queries
```typescript
const getUserById = db.query.users
  .findFirst({ where: eq(schema.users.id, $userId) })
  .prepare('get_user_by_id');

const user = await getUserById.execute({ userId });
```

### 3. Use Transactions for Multiple Operations
```typescript
await db.transaction(async (tx) => {
  // All queries here are atomic
});
```

### 4. Use `.returning()` for Insert/Update
```typescript
const [user] = await db
  .insert(schema.users)
  .values({ ... })
  .returning(); // Returns the inserted row
```

---

## Comparison: Raw SQL vs Drizzle

### Raw SQL (Old)
```typescript
const profile = await queryOne<ProfileModel>(
  `SELECT * FROM profiles WHERE user_id = $1`,
  [userId]
);
```

### Drizzle ORM (New)
```typescript
const profile = await db.query.profiles.findFirst({
  where: eq(schema.profiles.userId, userId),
});
```

**Benefits:**
- ✅ Type-safe - catches errors at compile time
- ✅ Autocomplete - IDE suggests available columns
- ✅ Refactor-safe - schema changes update queries automatically
- ✅ SQL injection prevention - parameterized by default

---

## Migration from Raw SQL

The database package now exports both:

1. **Legacy raw SQL** - `query()`, `queryOne()` functions
2. **New Drizzle ORM** - `db` client and `schema`

You can use both in parallel:

```typescript
import { query, db, schema } from '@letsmeet/database';
import { eq } from 'drizzle-orm';

// Old way (still works)
const user1 = await query('SELECT * FROM users WHERE id = $1', [id]);

// New way (recommended)
const user2 = await db.query.users.findFirst({
  where: eq(schema.users.id, id),
});
```

---

## Troubleshooting

### Connection Issues
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
bun run db:studio
```

### Migration Conflicts
```bash
# Reset and regenerate
rm -rf drizzle/
bun run db:generate
```

### Type Errors
```bash
# Rebuild database package
cd packages/database
bun run build
```

---

## Resources

- **Drizzle Docs**: https://orm.drizzle.team
- **Neon Docs**: https://neon.tech/docs
- **Drizzle Studio**: Local database UI
- **Schema Reference**: `packages/database/src/schema/`

---

## Next Steps

1. ✅ Schema and migrations created
2. ✅ Tables created in database
3. ⏳ Migrate query functions to use Drizzle
4. ⏳ Add database indexes for performance
5. ⏳ Add relations to schema for joins
6. ⏳ Update seed scripts to use Drizzle
