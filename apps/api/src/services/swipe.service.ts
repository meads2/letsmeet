/**
 * Swipe Service
 *
 * Business logic for swipe actions and match detection
 */

import {
  createSwipe as dbCreateSwipe,
  getTodaySwipeCount,
} from '@letsmeet/database';
import type { CreateSwipeInput, SwipeResult } from '@letsmeet/shared';
import { RateLimitError } from '../errors';
import { ProfileService } from './profile.service';
import type { RedisClient } from '../plugins/redis';

const FREE_DAILY_LIMIT = 50;

export class SwipeService {
  constructor(
    private profileService: ProfileService,
    private redis: RedisClient
  ) {}

  /**
   * Validate swipe limits for free users
   */
  private async validateSwipeLimit(userId: string): Promise<void> {
    const isPremium = await this.profileService.isPremiumUser(userId);

    // Premium users have unlimited swipes
    if (isPremium) {
      return;
    }

    // Check daily swipe count for free users
    const count = await getTodaySwipeCount(userId);

    if (count >= FREE_DAILY_LIMIT) {
      throw new RateLimitError(
        `Daily swipe limit reached. Upgrade to premium for unlimited swipes.`
      );
    }
  }

  /**
   * Create a swipe action
   * Enforces limits and detects matches
   */
  async createSwipeAction(input: CreateSwipeInput): Promise<SwipeResult> {
    // Validate swipe limit
    await this.validateSwipeLimit(input.userId);

    // Create the swipe (database handles match detection)
    const result = await dbCreateSwipe(input);

    // Invalidate feed cache for this user
    await this.redis.invalidatePattern(`feed:${input.userId}:*`);
    await this.redis.invalidatePattern(`feed-count:${input.userId}`);

    // If a match was created, invalidate both users' match lists
    if (result.matched && result.matchId) {
      await this.redis.invalidatePattern(`matches:${input.userId}`);
      await this.redis.invalidatePattern(`matches:${input.targetUserId}`);
    }

    return result;
  }

  /**
   * Get swipe statistics for a user
   */
  async getSwipeStats(userId: string): Promise<{ count: number; limit: number | null }> {
    const isPremium = await this.profileService.isPremiumUser(userId);
    const count = await getTodaySwipeCount(userId);

    return {
      count,
      limit: isPremium ? null : FREE_DAILY_LIMIT,
    };
  }
}
