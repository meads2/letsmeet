/**
 * useSubscription Hook
 *
 * Manages user subscription status and features
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { getProfileByUserId } from '../api/database/queries/profiles';
import {
  getFeaturesForTier,
  hasFeature as checkFeature,
  getDailyLikesLimit as getLikesLimit,
  type SubscriptionTier,
  type SubscriptionFeatures,
} from '../api/payments/subscription-config';

/**
 * Get user's subscription tier and features
 */
export function useSubscription() {
  const { userId } = useAuth();

  const query = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;

      const profile = await getProfileByUserId(userId);
      if (!profile) return null;

      // Determine tier based on profile's premium status
      // In production, you'd check the actual subscription tier from Stripe
      const tier: SubscriptionTier = profile.isPremium ? 'premium' : 'free';

      return {
        tier,
        features: getFeaturesForTier(tier),
        isPremium: profile.isPremium,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const tier = query.data?.tier || 'free';
  const features = query.data?.features || getFeaturesForTier('free');
  const isPremium = query.data?.isPremium || false;

  return {
    tier,
    features,
    isPremium,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Check if user has a specific feature
 */
export function useHasFeature(feature: keyof SubscriptionFeatures): boolean {
  const { tier } = useSubscription();
  return checkFeature(tier, feature);
}

/**
 * Get daily likes limit
 */
export function useDailyLikesLimit(): number | 'unlimited' {
  const { tier } = useSubscription();
  return getLikesLimit(tier);
}

/**
 * Check if user can perform action based on limits
 */
export function useCanPerformAction(action: 'like' | 'superLike' | 'boost' | 'rewind'): boolean {
  const { features } = useSubscription();

  switch (action) {
    case 'like':
      return features.dailyLikesLimit === 'unlimited' || features.dailyLikesLimit > 0;
    case 'superLike':
      return features.superLikesPerWeek > 0;
    case 'boost':
      return features.boostsPerMonth > 0;
    case 'rewind':
      return features.canRewindSwipes;
    default:
      return false;
  }
}
