/**
 * Swipe Queries
 *
 * Swipe actions and match detection
 */

import { query, queryOne } from '../client';
import type { SwipeModel, CreateSwipeInput, MatchResult } from '../models/swipe';
import { createMatch } from './matches';

/**
 * Create a swipe and check for match
 */
export const createSwipe = async (input: CreateSwipeInput): Promise<MatchResult> => {
  // Insert the swipe
  const swipe = await queryOne<SwipeModel>(
    `INSERT INTO swipes (user_id, target_user_id, action)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.userId, input.targetUserId, input.action]
  );

  if (!swipe) {
    throw new Error('Failed to create swipe');
  }

  // Only check for match if action is 'like' or 'super_like'
  if (input.action === 'pass') {
    return { isMatch: false };
  }

  // Check if target user also liked this user
  const reciprocalSwipe = await queryOne<SwipeModel>(
    `SELECT * FROM swipes
     WHERE user_id = $1
       AND target_user_id = $2
       AND action IN ('like', 'super_like')`,
    [input.targetUserId, input.userId]
  );

  // If reciprocal like exists, create a match
  if (reciprocalSwipe) {
    const match = await createMatch({
      user1Id: input.userId,
      user2Id: input.targetUserId,
      matchedAt: new Date(),
    });

    return {
      isMatch: true,
      matchId: match.id,
    };
  }

  return { isMatch: false };
};

/**
 * Check if user has already swiped on target
 */
export const hasSwipedOn = async (userId: string, targetUserId: string): Promise<boolean> => {
  const swipe = await queryOne<SwipeModel>(
    `SELECT * FROM swipes
     WHERE user_id = $1 AND target_user_id = $2`,
    [userId, targetUserId]
  );

  return swipe !== null;
};

/**
 * Get all user IDs that this user has swiped on
 */
export const getSwipedUserIds = async (userId: string): Promise<string[]> => {
  const swipes = await query<{ target_user_id: string }>(
    `SELECT target_user_id FROM swipes WHERE user_id = $1`,
    [userId]
  );

  return swipes.map(s => s.target_user_id);
};

/**
 * Get users who liked this user (for premium feature)
 */
export const getUsersWhoLikedMe = async (userId: string): Promise<string[]> => {
  const swipes = await query<{ user_id: string }>(
    `SELECT DISTINCT user_id FROM swipes
     WHERE target_user_id = $1
       AND action IN ('like', 'super_like')
       AND user_id NOT IN (
         SELECT target_user_id FROM swipes WHERE user_id = $1
       )`,
    [userId]
  );

  return swipes.map(s => s.user_id);
};

/**
 * Get swipe count for today (for daily limit)
 */
export const getTodaySwipeCount = async (userId: string): Promise<number> => {
  const result = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM swipes
     WHERE user_id = $1
       AND created_at >= CURRENT_DATE`,
    [userId]
  );

  return result?.count || 0;
};

/**
 * Undo last swipe (premium feature)
 */
export const undoLastSwipe = async (userId: string): Promise<SwipeModel | null> => {
  // Get the last swipe
  const lastSwipe = await queryOne<SwipeModel>(
    `SELECT * FROM swipes
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!lastSwipe) {
    return null;
  }

  // Delete the swipe
  await query(
    `DELETE FROM swipes WHERE id = $1`,
    [lastSwipe.id]
  );

  return lastSwipe;
};
