/**
 * Statsig Integration
 *
 * Feature flags and A/B testing with Statsig
 */

import { useGate, useExperiment, useConfig } from '@statsig/expo-bindings';

/**
 * Check if a feature gate is enabled
 */
export const useFeatureGate = (gateName: string) => {
  const { value: isEnabled } = useGate(gateName);
  return isEnabled;
};

/**
 * Get experiment variant
 */
export const useExperimentVariant = (experimentName: string) => {
  const experiment = useExperiment(experimentName);
  return {
    variant: experiment.config.getValue('variant'),
    parameters: experiment.config,
  };
};

/**
 * Get dynamic config
 */
export const useDynamicConfig = (configName: string) => {
  const config = useConfig(configName);
  return config;
};

// Add more Statsig utilities here
