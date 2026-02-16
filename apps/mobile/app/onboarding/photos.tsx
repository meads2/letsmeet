/**
 * Onboarding Step 1: Photos
 *
 * Upload profile photos
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PhotoUploader } from '../../components/profile/photo-uploader';

export default function OnboardingPhotos() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);

  const handleContinue = () => {
    if (photos.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo to continue.');
      return;
    }

    // Store photos in temporary state (will be saved in final step)
    // TODO: Use React Context or AsyncStorage to persist across steps
    router.push({
      pathname: '/onboarding/basic-info',
      params: { photos: JSON.stringify(photos) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>Step 1 of 3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Add Your Photos</Text>
        <Text style={styles.subtitle}>
          Show your best self! Add at least 2 photos{'\n'}
          to increase your chances of matching
        </Text>

        <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={6} />

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Photo Tips:</Text>
          <Text style={styles.tip}>• Use recent, clear photos</Text>
          <Text style={styles.tip}>• Show your face clearly</Text>
          <Text style={styles.tip}>• Include variety (close-up, full body, hobbies)</Text>
          <Text style={styles.tip}>• Avoid group photos as your first picture</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, photos.length === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={photos.length === 0}
        >
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
    lineHeight: 24,
    marginBottom: 24,
  },
  tips: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
