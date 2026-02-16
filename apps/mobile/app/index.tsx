/**
 * Landing Page
 *
 * Public landing page with sign-up CTA
 * Redirects to main app if already authenticated
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)/explore');
    }
  }, [isSignedIn, router]);

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C06C84', '#6C5B7B']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💕</Text>
        </View>

        {/* App Name */}
        <Text style={styles.title}>LetsMeet</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Find meaningful connections{'\n'}through authentic conversations
        </Text>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.feature}>✓ Swipe to connect</Text>
          <Text style={styles.feature}>✓ Match with like-minded people</Text>
          <Text style={styles.feature}>✓ Start meaningful conversations</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FF6B9D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    alignItems: 'center',
    gap: 8,
  },
  feature: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});
