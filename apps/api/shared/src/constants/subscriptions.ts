/**
 * Subscription Configuration
 *
 * Pricing tiers and feature definitions
 */

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface SubscriptionFeatures {
  dailyLikesLimit: number | 'unlimited';
  superLikesPerWeek: number;
  canSeeWhoLikedYou: boolean;
  canRewindSwipes: boolean;
  boostsPerMonth: number;
  hasAdvancedFilters: boolean;
  isPriorityInFeed: boolean;
  canSendGifs: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number; // in cents
  priceDisplay: string;
  interval: 'month' | 'year';
  features: SubscriptionFeatures;
  stripeProductId?: string;
  stripePriceId?: string;
  popular?: boolean;
}

/**
 * Free tier features
 */
export const FREE_FEATURES: SubscriptionFeatures = {
  dailyLikesLimit: 50,
  superLikesPerWeek: 0,
  canSeeWhoLikedYou: false,
  canRewindSwipes: false,
  boostsPerMonth: 0,
  hasAdvancedFilters: false,
  isPriorityInFeed: false,
  canSendGifs: false,
};

/**
 * Premium tier features
 */
export const PREMIUM_FEATURES: SubscriptionFeatures = {
  dailyLikesLimit: 'unlimited',
  superLikesPerWeek: 5,
  canSeeWhoLikedYou: true,
  canRewindSwipes: true,
  boostsPerMonth: 1,
  hasAdvancedFilters: false,
  isPriorityInFeed: false,
  canSendGifs: true,
};

/**
 * Premium Plus tier features
 */
export const PREMIUM_PLUS_FEATURES: SubscriptionFeatures = {
  dailyLikesLimit: 'unlimited',
  superLikesPerWeek: 999, // Effectively unlimited
  canSeeWhoLikedYou: true,
  canRewindSwipes: true,
  boostsPerMonth: 4,
  hasAdvancedFilters: true,
  isPriorityInFeed: true,
  canSendGifs: true,
};

/**
 * Subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: 'Free',
    interval: 'month',
    features: FREE_FEATURES,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999, // $9.99
    priceDisplay: '$9.99',
    interval: 'month',
    features: PREMIUM_FEATURES,
    popular: true,
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 1999, // $19.99
    priceDisplay: '$19.99',
    interval: 'month',
    features: PREMIUM_PLUS_FEATURES,
  },
];

/**
 * Get features for a subscription tier
 */
export const getFeaturesForTier = (tier: SubscriptionTier): SubscriptionFeatures => {
  switch (tier) {
    case 'premium':
      return PREMIUM_FEATURES;
    case 'premium_plus':
      return PREMIUM_PLUS_FEATURES;
    case 'free':
    default:
      return FREE_FEATURES;
  }
};

/**
 * Check if user has a specific feature
 */
export const hasFeature = (
  tier: SubscriptionTier,
  feature: keyof SubscriptionFeatures
): boolean => {
  const features = getFeaturesForTier(tier);
  return !!features[feature];
};

/**
 * Get daily likes remaining
 */
export const getDailyLikesLimit = (tier: SubscriptionTier): number | 'unlimited' => {
  const features = getFeaturesForTier(tier);
  return features.dailyLikesLimit;
};
