/**
 * useSubscription Hook
 *
 * Manages user subscription status and features
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from './use-profile';
import {
  getFeaturesForTier,
  hasFeature as checkFeature,
  getDailyLikesLimit as getLikesLimit,
  type SubscriptionTier,
  type SubscriptionFeatures,
} from '@letsmeet/shared';

/**
 * Get user's subscription tier and features
 */
export function useSubscription() {
  const { data: profile, isLoading } = useProfile();

  // Determine tier based on profile's premium status
  // In production, you'd check the actual subscription tier from Stripe
  const tier: SubscriptionTier = profile?.isPremium ? 'premium' : 'free';
  const features = getFeaturesForTier(tier);
  const isPremium = profile?.isPremium || false;

  return {
    tier,
    features,
    isPremium,
    isLoading,
    refetch: () => {}, // Profile refetch is handled by useProfile hook
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
