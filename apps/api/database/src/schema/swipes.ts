/**
 * Swipes Table Schema
 *
 * Stores swipe actions (like, pass, super_like)
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const swipes = pgTable('swipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: uuid('target_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'like', 'pass', 'super_like'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
