/**
 * Feature Flags
 *
 * Centralized feature flag definitions and constants
 */

/**
 * Feature gate names
 */
export const FeatureGates = {
  // Premium features
  SUPER_LIKES: 'super_likes_enabled',
  BOOST_FEATURE: 'boost_feature_enabled',
  SEE_WHO_LIKED_YOU: 'see_who_liked_you',
  REWIND_SWIPES: 'rewind_swipes',
  UNLIMITED_LIKES: 'unlimited_likes',
  ADVANCED_FILTERS: 'advanced_filters',

  // Experimental features
  VIDEO_PROFILES: 'video_profiles',
  VOICE_MESSAGES: 'voice_messages',
  AI_MATCHMAKING: 'ai_matchmaking',
  INTERESTS_MATCHING: 'interests_matching',

  // Beta features
  GROUP_DATES: 'group_dates',
  VIRTUAL_DATES: 'virtual_dates',
} as const;

/**
 * Experiment names
 */
export const Experiments = {
  SWIPE_ALGORITHM: 'swipe_algorithm_v2',
  MATCH_MODAL_DESIGN: 'match_modal_design',
  ONBOARDING_FLOW: 'onboarding_flow_v3',
  PRICING_TEST: 'subscription_pricing_test',
  PROFILE_CARD_LAYOUT: 'profile_card_layout_v2',
} as const;

/**
 * Dynamic config names
 */
export const DynamicConfigs = {
  APP_CONFIG: 'app_config',
  PRICING_TIERS: 'pricing_tiers',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;
