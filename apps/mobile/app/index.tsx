/**
 * Landing Page
 *
 * Public landing page with sign-up CTA
 * Redirects to main app if already authenticated
 */

import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(home)/prospects');
    }
  }, [isSignedIn, router]);

  return (
    <LinearGradient
      colors={['#FFF5F5', '#FFE5E5', '#F5F3F7']}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center p-6">
        {/* Logo/Icon */}
        <View className="w-32 h-32 rounded-full bg-white/20 justify-center items-center mb-6">
          <Text className="text-6xl">💕</Text>
        </View>

        {/* App Name */}
        <Text className="text-5xl font-bold text-primary-600 mb-3">
          LetsMeet
        </Text>

        {/* Tagline */}
        <Text className="text-lg text-neutral-700 text-center mb-12 opacity-90">
          Find meaningful connections{'\n'}through authentic conversations
        </Text>

        {/* CTA Buttons */}
        <View className="w-full gap-4 mb-12">
          <Button
            size="lg"
            onPress={() => router.push('/(auth)/sign-up')}
            className="shadow-md"
          >
            Create Account
          </Button>

          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            Sign In
          </Button>
        </View>

        {/* Features */}
        <View className="items-center gap-2">
          <Text className="text-base text-neutral-700 opacity-80">✓ Swipe to connect</Text>
          <Text className="text-base text-neutral-700 opacity-80">✓ Match with like-minded people</Text>
          <Text className="text-base text-neutral-700 opacity-80">✓ Start meaningful conversations</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
