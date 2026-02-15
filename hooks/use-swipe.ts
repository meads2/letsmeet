/**
 * useSwipe Hook
 *
 * Handles swipe actions and match detection
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { createSwipe } from '../api/database/queries/swipes';
import type { CreateSwipeInput, MatchResult } from '../api/database/models/swipe';
import { useState, useCallback } from 'react';

export function useSwipe() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const swipeMutation = useMutation({
    mutationFn: async (input: CreateSwipeInput) => {
      return await createSwipe(input);
    },
    onSuccess: (result, variables) => {
      // Invalidate feed to remove swiped profile
      queryClient.invalidateQueries({ queryKey: ['feed', userId] });
      queryClient.invalidateQueries({ queryKey: ['feed-count', userId] });

      // If it's a match, show match modal
      if (result.isMatch) {
        setMatchResult(result);
        // Invalidate matches list to show new match
        queryClient.invalidateQueries({ queryKey: ['matches', userId] });
      }
    },
  });

  const swipeLeft = useCallback(
    (targetUserId: string) => {
      if (!userId) return;
      swipeMutation.mutate({
        userId,
        targetUserId,
        action: 'pass',
      });
    },
    [userId, swipeMutation]
  );

  const swipeRight = useCallback(
    (targetUserId: string) => {
      if (!userId) return;
      swipeMutation.mutate({
        userId,
        targetUserId,
        action: 'like',
      });
    },
    [userId, swipeMutation]
  );

  const superLike = useCallback(
    (targetUserId: string) => {
      if (!userId) return;
      swipeMutation.mutate({
        userId,
        targetUserId,
        action: 'super_like',
      });
    },
    [userId, swipeMutation]
  );

  const clearMatchResult = useCallback(() => {
    setMatchResult(null);
  }, []);

  return {
    swipeLeft,
    swipeRight,
    superLike,
    isLoading: swipeMutation.isPending,
    error: swipeMutation.error,
    matchResult,
    clearMatchResult,
  };
}
