/**
 * Onboarding Step 3: Preferences
 *
 * Dating preferences and profile creation
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { createProfile } from '../../api/database/queries/profiles';
import type { CreateProfileInput } from '../../api/database/models/profile';

export default function OnboardingPreferences() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();

  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [relationshipGoal, setRelationshipGoal] = useState<string>('');
  const [ageRangeMin] = useState(18);
  const [ageRangeMax] = useState(35);
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Men' },
    { value: 'female', label: 'Women' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
  ];

  const goalOptions = [
    { value: 'relationship', label: 'Relationship', icon: '💕' },
    { value: 'casual', label: 'Something Casual', icon: '✨' },
    { value: 'friendship', label: 'New Friends', icon: '👋' },
    { value: 'unsure', label: 'Not Sure Yet', icon: '🤷' },
  ];

  const toggleLookingFor = (value: string) => {
    if (lookingFor.includes(value)) {
      setLookingFor(lookingFor.filter((v) => v !== value));
    } else {
      setLookingFor([...lookingFor, value]);
    }
  };

  const handleComplete = async () => {
    if (lookingFor.length === 0) {
      Alert.alert('Preference Required', 'Please select who you&apos;re interested in meeting.');
      return;
    }

    if (!relationshipGoal) {
      Alert.alert('Goal Required', 'Please select what you&apos;re looking for.');
      return;
    }

    setLoading(true);

    try {
      // Parse data from previous steps
      const photos = JSON.parse(params.photos as string);
      const displayName = params.displayName as string;
      const age = parseInt(params.age as string);
      const gender = params.gender as 'male' | 'female' | 'non-binary' | 'other';
      const bio = params.bio as string || undefined;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Create profile
      const profileInput: CreateProfileInput = {
        userId,
        displayName,
        age,
        gender,
        lookingFor: lookingFor as any,
        bio,
        photos,
        interests: [], // Will be added later
        relationshipGoal: relationshipGoal as any,
        maxDistance: 50, // Default 50km
        ageRangeMin,
        ageRangeMax,
      };

      await createProfile(profileInput);

      // Navigate to main app
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Preferences</Text>
        <Text style={styles.subtitle}>
          Help us find your perfect matches
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>I&apos;m interested in... *</Text>
          <View style={styles.optionsContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  lookingFor.includes(option.value) && styles.optionButtonActive,
                ]}
                onPress={() => toggleLookingFor(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    lookingFor.includes(option.value) && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>I&apos;m looking for... *</Text>
          <View style={styles.optionsContainer}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.goalButton,
                  relationshipGoal === option.value && styles.goalButtonActive,
                ]}
                onPress={() => setRelationshipGoal(option.value)}
              >
                <Text style={styles.goalIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.goalText,
                    relationshipGoal === option.value && styles.goalTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Age range: {ageRangeMin} - {ageRangeMax}
          </Text>
          <Text style={styles.hint}>
            (You can adjust this later in settings)
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B9D',
  },
  progress: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  optionButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  goalButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  goalTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
