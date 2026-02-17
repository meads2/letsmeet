/**
 * Swipe Model
 *
 * Tracks all swipe actions (like/pass/super_like)
 */

export interface SwipeModel {
  id: string;
  userId: string; // User who swiped
  targetUserId: string; // User being swiped on
  action: 'like' | 'pass' | 'super_like';
  createdAt: Date;
}

export type CreateSwipeInput = Omit<SwipeModel, 'id' | 'createdAt'>;

/**
 * Match detection result
 */
export interface MatchResult {
  isMatch: boolean;
  matchId?: string;
}
