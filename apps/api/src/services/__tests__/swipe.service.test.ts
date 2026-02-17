/**
 * SwipeService Tests
 *
 * Tests for swipe limit enforcement and match detection
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { SwipeService } from '../swipe.service';
import { ProfileService } from '../profile.service';
import { RateLimitError } from '../../errors';
import type { SwipeResult, CreateSwipeInput } from '@letsmeet/shared';

// Mock database functions
const mockCreateSwipe = mock();
const mockGetTodaySwipeCount = mock();

// Mock the database module
mock.module('@letsmeet/database', () => ({
  createSwipe: mockCreateSwipe,
  getTodaySwipeCount: mockGetTodaySwipeCount,
}));

describe('SwipeService', () => {
  let swipeService: SwipeService;
  let mockProfileService: ProfileService;
  let mockRedis: any;

  beforeEach(() => {
    // Mock ProfileService
    mockProfileService = {
      isPremiumUser: mock(() => Promise.resolve(false)),
    } as any;

    // Mock Redis client
    mockRedis = {
      invalidatePattern: mock(() => Promise.resolve(5)),
    };

    swipeService = new SwipeService(mockProfileService, mockRedis);

    mockCreateSwipe.mockReset();
    mockGetTodaySwipeCount.mockReset();
  });

  describe('createSwipeAction', () => {
    const swipeInput: CreateSwipeInput = {
      userId: 'user-123',
      targetUserId: 'user-456',
      action: 'like',
      swipedAt: new Date(),
    };

    it('should allow swipe for free user under daily limit', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(false);
      mockGetTodaySwipeCount.mockResolvedValue(25); // Under 50 limit

      const mockResult: SwipeResult = {
        matched: false,
        matchId: null,
      };
      mockCreateSwipe.mockResolvedValue(mockResult);

      const result = await swipeService.createSwipeAction(swipeInput);

      expect(result).toEqual(mockResult);
      expect(mockGetTodaySwipeCount).toHaveBeenCalledWith('user-123');
      expect(mockCreateSwipe).toHaveBeenCalledWith(swipeInput);
    });

    it('should BLOCK free user at daily limit', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(false);
      mockGetTodaySwipeCount.mockResolvedValue(50); // At limit

      await expect(
        swipeService.createSwipeAction(swipeInput)
      ).rejects.toThrow(RateLimitError);

      expect(mockCreateSwipe).not.toHaveBeenCalled();
    });

    it('should BLOCK free user over daily limit', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(false);
      mockGetTodaySwipeCount.mockResolvedValue(75); // Over limit

      await expect(
        swipeService.createSwipeAction(swipeInput)
      ).rejects.toThrow(RateLimitError);
    });

    it('should allow unlimited swipes for premium users', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(true);
      mockGetTodaySwipeCount.mockResolvedValue(100); // Over free limit

      const mockResult: SwipeResult = {
        matched: false,
        matchId: null,
      };
      mockCreateSwipe.mockResolvedValue(mockResult);

      const result = await swipeService.createSwipeAction(swipeInput);

      expect(result).toEqual(mockResult);
      // Should NOT check count for premium users
      expect(mockGetTodaySwipeCount).not.toHaveBeenCalled();
      expect(mockCreateSwipe).toHaveBeenCalledWith(swipeInput);
    });

    it('should invalidate feed cache after swipe', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(true);
      mockCreateSwipe.mockResolvedValue({ matched: false, matchId: null });

      await swipeService.createSwipeAction(swipeInput);

      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('feed:user-123:*');
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('feed-count:user-123');
    });

    it('should invalidate match caches when match is created', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(true);

      const matchResult: SwipeResult = {
        matched: true,
        matchId: 'match-789',
      };
      mockCreateSwipe.mockResolvedValue(matchResult);

      await swipeService.createSwipeAction(swipeInput);

      // Should invalidate both users' match lists
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('matches:user-123');
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('matches:user-456');
    });
  });

  describe('getSwipeStats', () => {
    it('should return stats for free user', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(false);
      mockGetTodaySwipeCount.mockResolvedValue(30);

      const stats = await swipeService.getSwipeStats('user-123');

      expect(stats).toEqual({
        count: 30,
        limit: 50,
      });
    });

    it('should return stats for premium user (unlimited)', async () => {
      (mockProfileService.isPremiumUser as any).mockResolvedValue(true);
      mockGetTodaySwipeCount.mockResolvedValue(100);

      const stats = await swipeService.getSwipeStats('user-123');

      expect(stats).toEqual({
        count: 100,
        limit: null, // null indicates unlimited
      });
    });
  });
});
