/**
 * Match Queries
 *
 * Operations for matched users
 */

import { query, queryOne } from '../client';
import type { MatchModel, CreateMatchInput, MatchWithProfile } from '@letsmeet/shared';

/**
 * Create a new match
 */
export const createMatch = async (input: CreateMatchInput): Promise<MatchModel> => {
  // Ensure user1Id is always less than user2Id for consistency
  const [user1Id, user2Id] = [input.user1Id, input.user2Id].sort();

  // Check if match already exists
  const existing = await queryOne<MatchModel>(
    `SELECT * FROM matches
     WHERE (user1_id = $1 AND user2_id = $2)
        OR (user1_id = $2 AND user2_id = $1)`,
    [user1Id, user2Id]
  );

  if (existing) {
    // If match was previously unmatched, reactivate it
    if (!existing.isActive) {
      return await reactivateMatch(existing.id);
    }
    return existing;
  }

  const match = await queryOne<MatchModel>(
    `INSERT INTO matches (user1_id, user2_id, matched_at, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [user1Id, user2Id, input.matchedAt]
  );

  if (!match) {
    throw new Error('Failed to create match');
  }

  return match;
};

/**
 * Get all matches for a user
 */
export const getUserMatches = async (userId: string): Promise<MatchWithProfile[]> => {
  const matches = await query<any>(
    `SELECT
       m.*,
       p.id as other_user_id,
       p.display_name,
       p.age,
       p.photos,
       p.bio,
       (
         SELECT COUNT(*)
         FROM messages msg
         WHERE msg.match_id = m.id
           AND msg.receiver_id = $1
           AND msg.read_at IS NULL
       ) as unread_count
     FROM matches m
     INNER JOIN profiles p ON (
       CASE
         WHEN m.user1_id = $1 THEN m.user2_id
         ELSE m.user1_id
       END = p.user_id
     )
     WHERE (m.user1_id = $1 OR m.user2_id = $1)
       AND m.is_active = true
     ORDER BY m.last_message_at DESC NULLS LAST, m.matched_at DESC`,
    [userId]
  );

  return matches.map(m => ({
    id: m.id,
    user1Id: m.user1_id,
    user2Id: m.user2_id,
    matchedAt: m.matched_at,
    lastMessageAt: m.last_message_at,
    isActive: m.is_active,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    otherUser: {
      id: m.other_user_id,
      displayName: m.display_name,
      age: m.age,
      photos: m.photos,
      bio: m.bio,
    },
    unreadCount: parseInt(m.unread_count) || 0,
  }));
};

/**
 * Get match by ID
 */
export const getMatchById = async (matchId: string): Promise<MatchModel | null> => {
  return await queryOne<MatchModel>(
    `SELECT * FROM matches WHERE id = $1`,
    [matchId]
  );
};

/**
 * Check if two users are matched
 */
export const areUsersMatched = async (userId1: string, userId2: string): Promise<boolean> => {
  const match = await queryOne<MatchModel>(
    `SELECT * FROM matches
     WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
       AND is_active = true`,
    [userId1, userId2]
  );

  return match !== null;
};

/**
 * Unmatch users
 */
export const unmatchUsers = async (matchId: string): Promise<void> => {
  await query(
    `UPDATE matches
     SET is_active = false, updated_at = NOW()
     WHERE id = $1`,
    [matchId]
  );
};

/**
 * Reactivate match
 */
export const reactivateMatch = async (matchId: string): Promise<MatchModel> => {
  const match = await queryOne<MatchModel>(
    `UPDATE matches
     SET is_active = true, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [matchId]
  );

  if (!match) {
    throw new Error('Match not found');
  }

  return match;
};

/**
 * Update last message timestamp
 */
export const updateLastMessageAt = async (matchId: string, timestamp: Date): Promise<void> => {
  await query(
    `UPDATE matches
     SET last_message_at = $1, updated_at = NOW()
     WHERE id = $2`,
    [timestamp, matchId]
  );
};
