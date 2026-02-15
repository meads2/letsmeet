/**
 * useFeed Hook
 *
 * Manages swipe feed with React Query caching
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { getFeedForUser, getFeedCount } from '../api/database/queries/feed';
import type { FeedProfile } from '../api/database/queries/feed';

/**
 * Fetch feed profiles for the current user
 */
export function useFeed(limit: number = 20) {
  const { userId } = useAuth();

  return useQuery<FeedProfile[]>({
    queryKey: ['feed', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await getFeedForUser(userId, limit);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Get feed count (how many profiles available)
 */
export function useFeedCount() {
  const { userId } = useAuth();

  return useQuery<number>({
    queryKey: ['feed-count', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await getFeedCount(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Infinite scroll feed (for future optimization)
 */
export function useInfiniteFeed(pageSize: number = 20) {
  const { userId } = useAuth();

  return useInfiniteQuery<FeedProfile[]>({
    queryKey: ['feed-infinite', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) throw new Error('User not authenticated');
      // Note: Would need to implement pagination in feed query
      return await getFeedForUser(userId, pageSize);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    enabled: !!userId,
  });
}
