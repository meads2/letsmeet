/**
 * Onboarding Welcome Screen
 *
 * Introduction to the onboarding flow
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C06C84', '#6C5B7B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.emoji}>💕</Text>
          <Text style={styles.title}>Welcome to LetsMeet!</Text>
          <Text style={styles.description}>
            Let&apos;s create your profile in 3 simple steps
          </Text>

          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Add Photos</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Tell Us About You</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Set Preferences</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/photos')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.9,
  },
  steps: {
    width: '100%',
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    color: '#FF6B9D',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FF6B9D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
