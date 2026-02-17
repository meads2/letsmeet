/**
 * Statsig Feature Gates (Stub)
 *
 * Temporary stub implementation for feature gates
 * TODO: Integrate with real Statsig SDK
 */

/**
 * Feature gate hook
 *
 * For now, returns a fixed value based on the feature name
 * In production, this would call the Statsig SDK
 */
export function useFeatureGate(featureName: string): boolean {
  // Stub implementation - enable all features for development
  console.warn(`Statsig not configured - feature gate "${featureName}" defaulting to true`);
  return true;
}

/**
 * Feature gate constants
 * These match the deleted api/experiments/features.ts structure
 */
export const FeatureGates = {
  SUPER_LIKES: 'super_likes',
  BOOSTS: 'boosts',
  REWIND: 'rewind',
  // Add other feature gates as needed
} as const;
