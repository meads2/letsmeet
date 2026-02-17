/**
 * Match Service
 *
 * Business logic for match management
 */

import {
  getUserMatches as dbGetUserMatches,
  getMatchById as dbGetMatchById,
  unmatchUsers as dbUnmatchUsers,
} from '@letsmeet/database';
import type { MatchWithProfile, MatchModel } from '@letsmeet/shared';
import { NotFoundError, ForbiddenError } from '../errors';
import type { RedisClient } from '../plugins/redis';

export class MatchService {
  constructor(private redis: RedisClient) {}

  /**
   * Get all matches for a user (with caching)
   */
  async getUserMatchesWithProfiles(userId: string): Promise<MatchWithProfile[]> {
    return await dbGetUserMatches(userId);
  }

  /**
   * Get a specific match by ID
   */
  async getMatchById(matchId: string): Promise<MatchModel | null> {
    return await dbGetMatchById(matchId);
  }

  /**
   * Unmatch users (with authorization check)
   */
  async unmatch(matchId: string, requestingUserId: string): Promise<void> {
    const match = await dbGetMatchById(matchId);

    if (!match) {
      throw new NotFoundError('Match');
    }

    // Verify user is a participant in this match
    if (match.user1Id !== requestingUserId && match.user2Id !== requestingUserId) {
      throw new ForbiddenError('You are not a participant in this match');
    }

    // Perform the unmatch
    await dbUnmatchUsers(matchId);

    // Invalidate both users' match caches
    await this.redis.invalidatePattern(`matches:${match.user1Id}`);
    await this.redis.invalidatePattern(`matches:${match.user2Id}`);

    // Invalidate message cache for this match
    await this.redis.invalidatePattern(`messages:${matchId}`);
  }
}
