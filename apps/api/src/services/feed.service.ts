/**
 * Feed Service
 *
 * Business logic for personalized feed generation
 * Implements Redis caching for expensive feed calculations
 */

import {
  getFeedForUser as dbGetFeedForUser,
  getFeedCount as dbGetFeedCount,
} from '@letsmeet/database';
import type { FeedProfile } from '@letsmeet/shared';
import type { RedisClient } from '../plugins/redis';

const FEED_CACHE_TTL = 300; // 5 minutes
const FEED_COUNT_CACHE_TTL = 600; // 10 minutes

export class FeedService {
  constructor(private redis: RedisClient) {}

  /**
   * Get personalized feed for user with caching
   * Feed calculation is expensive (Haversine distance, CTEs)
   * so we cache it to reduce database load
   */
  async getPersonalizedFeed(userId: string, limit: number = 50): Promise<FeedProfile[]> {
    const cacheKey = `feed:${userId}:${limit}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        // Invalid cache data, continue to fetch
      }
    }

    // Cache miss - fetch from database
    const feed = await dbGetFeedForUser(userId, limit);

    // Cache the result
    await this.redis.set(cacheKey, JSON.stringify(feed), FEED_CACHE_TTL);

    return feed;
  }

  /**
   * Get count of available profiles in feed with caching
   */
  async getFeedProfileCount(userId: string): Promise<number> {
    const cacheKey = `feed-count:${userId}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return parseInt(cached, 10);
    }

    // Cache miss - fetch from database
    const count = await dbGetFeedCount(userId);

    // Cache the result
    await this.redis.set(cacheKey, count.toString(), FEED_COUNT_CACHE_TTL);

    return count;
  }

  /**
   * Invalidate feed cache for a user
   * Called after profile updates that affect feed results
   */
  async invalidateFeedCache(userId: string): Promise<void> {
    await this.redis.invalidatePattern(`feed:${userId}:*`);
    await this.redis.invalidatePattern(`feed-count:${userId}`);
  }

  /**
   * Invalidate all feed caches
   * Called after changes that affect all users' feeds (rare)
   */
  async invalidateAllFeeds(): Promise<void> {
    await this.redis.invalidatePattern('feed:*');
    await this.redis.invalidatePattern('feed-count:*');
  }
}
