/**
 * Clerk Authentication Integration
 *
 * Wrapper functions and utilities for Clerk authentication
 */

import { useAuth, useUser } from '@clerk/clerk-expo';

/**
 * Hook to get current authentication state
 */
export const useAuthState = () => {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  return {
    isAuthenticated: isSignedIn,
    userId,
    user,
  };
};

/**
 * Get user metadata from Clerk
 */
export const getUserMetadata = (user: any) => {
  return {
    id: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,
  };
};

// Add more Clerk-specific utilities here
