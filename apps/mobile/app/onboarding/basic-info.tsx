/**
 * Onboarding Step 2: Basic Info
 *
 * Name, age, gender, and bio
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OnboardingBasicInfo() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other' | ''>('');
  const [bio, setBio] = useState('');

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
  ];

  const handleContinue = () => {
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age (18-120).');
      return;
    }

    if (!gender) {
      Alert.alert('Gender Required', 'Please select your gender.');
      return;
    }

    router.push({
      pathname: '/onboarding/preferences',
      params: {
        ...params,
        displayName,
        age,
        gender,
        bio,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>Step 2 of 3</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>
          Tell us a bit about yourself
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={50}
          />

          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={3}
          />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  gender === option.value && styles.genderButtonActive,
                ]}
                onPress={() => setGender(option.value as any)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === option.value && styles.genderTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell others about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{bio.length}/500</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
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
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: -12,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genderButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  genderButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderTextActive: {
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
