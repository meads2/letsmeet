/**
 * Photo Uploader Component
 *
 * Handles photo selection, upload, and management
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadImage } from '../../lib/image-upload';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 6 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to upload profile pictures.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (uri: string) => {
    setUploading(true);
    try {
      const uploadResult = await uploadImage(uri);
      onChange([...photos, uploadResult.url]);
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newPhotos = photos.filter((_, i) => i !== index);
          onChange(newPhotos);
        },
      },
    ]);
  };

  const showAddOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View className="my-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {photos.map((photo, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri: photo }}
              className="w-[120px] h-40 rounded-xl bg-neutral-100"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-white/90 rounded-full"
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={28} color="#FF3B30" />
            </TouchableOpacity>
            {index === 0 && (
              <View className="absolute bottom-2 left-2 bg-primary-500 px-2 py-1 rounded">
                <Text className="text-white text-xs font-bold">Primary</Text>
              </View>
            )}
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            className="w-[120px] h-40 rounded-xl border-2 border-dashed border-primary-500 justify-center items-center bg-white"
            onPress={showAddOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FF6B6B" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={48} color="#FF6B6B" />
                <Text className="text-primary-500 text-sm font-semibold mt-2">Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text className="text-sm text-neutral-500 mt-3 text-center">
        {photos.length} / {maxPhotos} photos • First photo is your primary photo
      </Text>
    </View>
  );
}
