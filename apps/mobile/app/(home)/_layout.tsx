/**
 * Tab Navigation Layout
 *
 * Bottom tab navigator with 4 tabs:
 * - Prospects: Swipe on unseen profiles (default landing)
 * - Explore: Trending profiles with pay-to-match
 * - Matches: Chat with matched users
 * - Profile: User profile and settings
 *
 * Includes auth guard to protect all tab routes
 */

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureGate } from '@statsig/expo-bindings';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useUnreadCount } from '../../hooks/use-matches';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const unreadCount = useUnreadCount();
  const isAdmin = useFeatureGate('admin_panel');

  // Auth guard: redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoaded) return;

    const inHome = segments[0] === '(home)';

    if (!isSignedIn && inHome) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="prospects"
        options={{
          title: 'Prospects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="heart" size={size} color={color} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-2 bg-primary-500 rounded-full min-w-[18px] h-[18px] justify-center items-center px-1">
                  <Text className="text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {isAdmin && (<>
        <Tabs.Screen
          name="admin-panel"
          options={{
            title: '[Intern] Admin',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={size} color={color} />
            ),
          }}
        />
      </>)}
    </Tabs>
  );
}
