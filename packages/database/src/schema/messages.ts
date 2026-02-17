/**
 * Messages Table Schema
 *
 * Stores chat messages between matched users
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { matches } from './matches';
import { users } from './users';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type').notNull().default('text'), // 'text', 'image', 'gif'
  mediaUrl: text('media_url'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
