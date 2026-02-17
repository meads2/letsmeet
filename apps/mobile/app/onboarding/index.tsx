/**
 * Onboarding Screen
 *
 * Collects basic profile info for new users
 */

import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api-client';
import { Button, Input } from '../../components/ui';

type Gender = 'male' | 'female' | 'non-binary' | 'other';
const GENDERS: Gender[] = ['male', 'female', 'non-binary', 'other'];

export default function OnboardingScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [lookingFor, setLookingFor] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleLookingFor = (g: Gender) => {
    setLookingFor((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSubmit = async () => {
    if (!userId || !gender || lookingFor.length === 0) return;

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 18 and 100.');
      return;
    }

    setLoading(true);
    try {
      await api.profiles.create({
        userId,
        displayName: displayName.trim(),
        age: ageNum,
        gender,
        lookingFor,
        photos: [],
        interests: [],
      });
      router.replace('/(home)/prospects');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    displayName.trim().length >= 1 &&
    age.length > 0 &&
    gender !== null &&
    lookingFor.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow p-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-neutral-900 mb-2">
              Create Your Profile
            </Text>
            <Text className="text-base text-neutral-500">
              Tell us a little about yourself to get started.
            </Text>
          </View>

          <View className="gap-6">
            <Input
              label="Display Name"
              placeholder="What should we call you?"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Input
              label="Age"
              placeholder="Your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              returnKeyType="next"
            />

            {/* Gender selection */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700">I am</Text>
              <View className="flex-row flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      gender === g
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        gender === g ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Looking for selection */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700">
                Interested in
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => toggleLookingFor(g)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      lookingFor.includes(g)
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        lookingFor.includes(g) ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              size="lg"
              onPress={handleSubmit}
              disabled={!isValid}
              loading={loading}
              className="mt-4"
            >
              Get Started
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
