/**
 * Matches Table Schema
 *
 * Stores matched users (mutual likes)
 */

import { pgTable, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const matches = pgTable('matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  user1Id: uuid('user1_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  matchedAt: timestamp('matched_at').notNull(),
  lastMessageAt: timestamp('last_message_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
