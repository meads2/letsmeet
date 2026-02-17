/**
 * Action Buttons Component
 *
 * Like, Pass, and Super Like buttons for swipe interface
 */

import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureGate, FeatureGates } from '../../lib/statsig';
import { useCanPerformAction } from '../../hooks/use-subscription';
import { useRouter } from 'expo-router';

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}

export function ActionButtons({
  onPass,
  onLike,
  onSuperLike,
  disabled = false,
}: ActionButtonsProps) {
  const router = useRouter();
  const superLikesEnabled = useFeatureGate(FeatureGates.SUPER_LIKES);
  const canSuperLike = useCanPerformAction('superLike');
  const canLike = useCanPerformAction('like');

  const handleLike = () => {
    if (!canLike) {
      Alert.alert(
        'Daily Limit Reached',
        'You&apos;ve reached your daily like limit. Upgrade to Premium for unlimited likes!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(home)/profile') },
        ]
      );
      return;
    }
    onLike();
  };

  const handleSuperLike = () => {
    if (!canSuperLike) {
      Alert.alert(
        'Premium Feature',
        'Super Likes are a Premium feature. Upgrade to send Super Likes!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(home)/profile') },
        ]
      );
      return;
    }
    onSuperLike();
  };

  return (
    <View className="flex-row items-center justify-center gap-4 py-5">
      {/* Pass Button */}
      <TouchableOpacity
        className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 items-center justify-center shadow-md"
        onPress={onPass}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={32} color="#FF3B30" />
      </TouchableOpacity>

      {/* Super Like Button (Premium Feature) */}
      {superLikesEnabled && (
        <TouchableOpacity
          className={`w-16 h-16 rounded-full bg-accent-500 items-center justify-center shadow-md${!canSuperLike ? ' opacity-40' : ''}`}
          onPress={handleSuperLike}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Like Button */}
      <TouchableOpacity
        className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center shadow-md"
        onPress={handleLike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
