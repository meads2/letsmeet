/**
 * Profiles Table Schema
 *
 * Stores user dating profiles with preferences and location
 */

import { pgTable, text, integer, boolean, timestamp, uuid, jsonb, real } from 'drizzle-orm/pg-core';
import { users } from './users';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Basic info
  displayName: text('display_name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(), // 'male', 'female', 'non_binary', 'other'
  lookingFor: text('looking_for').notNull(), // 'male', 'female', 'everyone'
  bio: text('bio'),

  // Location
  city: text('city'),
  state: text('state'),
  country: text('country'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),

  // Media and interests
  photos: jsonb('photos').$type<string[]>().notNull(), // Array of photo URLs
  interests: jsonb('interests').$type<string[]>(), // Array of interest tags

  // Preferences
  relationshipGoal: text('relationship_goal'), // 'casual', 'relationship', 'friends', etc.
  maxDistance: integer('max_distance').notNull().default(50), // km
  ageRangeMin: integer('age_range_min').notNull().default(18),
  ageRangeMax: integer('age_range_max').notNull().default(99),

  // Status
  isActive: boolean('is_active').notNull().default(true),
  lastActive: timestamp('last_active').defaultNow(),
  isPremium: boolean('is_premium').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
