/**
 * useProfile Hook
 *
 * Fetches current user's profile via API
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '../lib/api-client';
import type { ProfileModel } from '@letsmeet/shared';

/**
 * Get current user's profile
 */
export function useProfile() {
  const { userId } = useAuth();

  return useQuery<ProfileModel>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await api.profiles.getMe();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
