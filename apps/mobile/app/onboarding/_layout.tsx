/**
 * Onboarding Layout
 *
 * Multi-step onboarding flow for new users
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
