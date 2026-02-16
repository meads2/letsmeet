/**
 * useMatches Hook
 *
 * Manages user matches with React Query
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '../lib/api-client';
import type { MatchWithProfile } from '@letsmeet/shared';

/**
 * Fetch all matches for the current user
 */
export function useMatches() {
  const { userId } = useAuth();

  return useQuery<MatchWithProfile[]>({
    queryKey: ['matches', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await api.matches.getAll();
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds - refresh frequently to show new matches
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Auto-refetch every minute
  });
}

/**
 * Get total unread message count across all matches
 */
export function useUnreadCount() {
  const { data: matches } = useMatches();

  const totalUnread = matches?.reduce((sum, match) => {
    return sum + (match.unreadCount || 0);
  }, 0) || 0;

  return totalUnread;
}
