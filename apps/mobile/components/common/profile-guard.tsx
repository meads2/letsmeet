/**
 * Profile Guard
 *
 * Redirects authenticated users to onboarding if they haven't created a profile yet
 */

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useProfile } from '../../hooks/use-profile';

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { data: profile, isLoading: profileLoading, error } = useProfile();

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) return;

    // Don't redirect if already in onboarding or auth screens
    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === '(auth)';
    if (inOnboarding || inAuth) return;

    // Wait for profile to load
    if (profileLoading) return;

    // If no profile or error loading profile, redirect to onboarding
    if (!profile || error) {
      router.replace('/onboarding');
    }
  }, [isSignedIn, authLoaded, profile, profileLoading, error, segments, router]);

  // Show loading while checking profile
  if (isSignedIn && profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
}

