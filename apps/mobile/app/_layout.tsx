/**
 * Root Layout
 *
 * Provider architecture:
 * ClerkProvider (authentication)
 * └── ClerkLoaded (ensures auth is ready)
 *     └── StatsigProvider (feature flags with user context)
 *         └── StripeProvider (payments)
 *             └── QueryClientProvider (data fetching)
 *                 └── App Navigation
 */

import { ClerkLoaded, ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { StatsigProviderExpo } from '@statsig/expo-bindings';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';
import { ErrorBoundary } from '../components/common/error-boundary';

// Clerk token cache
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
  },
});

// Get environment variables
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
const statsigClientKey = process.env.EXPO_PUBLIC_STATSIG_CLIENT_KEY!;

// Statsig wrapper to ensure user context from Clerk
function StatsigWrapper({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();

  // Only initialize Statsig if user is signed in
  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <StatsigProviderExpo
      sdkKey={statsigClientKey}
      user={{
        userID: userId ?? undefined,
        email: user?.primaryEmailAddress?.emailAddress ?? undefined,
        custom: {
          firstName: user?.firstName ?? undefined,
          lastName: user?.lastName ?? undefined,
        },
      }}
      options={{
        environment: { tier: __DEV__ ? 'development' : 'production' },
      }}
      loadingComponent={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      {children}
    </StatsigProviderExpo>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <StatsigWrapper>
            <StripeProvider publishableKey={stripePublishableKey}>
              <QueryClientProvider client={queryClient}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen name="sign-up" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </QueryClientProvider>
            </StripeProvider>
          </StatsigWrapper>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
