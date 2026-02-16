/**
 * Action Buttons Component
 *
 * Like, Pass, and Super Like buttons for swipe interface
 */

import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureGate } from '../../api/experiments/statsig';
import { FeatureGates } from '../../api/experiments/features';
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
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/marketplace') },
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
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/marketplace') },
        ]
      );
      return;
    }
    onSuperLike();
  };

  return (
    <View style={styles.container}>
      {/* Pass Button */}
      <TouchableOpacity
        style={[styles.button, styles.passButton]}
        onPress={onPass}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={32} color="#FF3B30" />
      </TouchableOpacity>

      {/* Super Like Button (Premium Feature) */}
      {superLikesEnabled && (
        <TouchableOpacity
          style={[styles.button, styles.superLikeButton, !canSuperLike && styles.buttonDisabled]}
          onPress={handleSuperLike}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={28} color={canSuperLike ? "#00A8FF" : "#CCC"} />
        </TouchableOpacity>
      )}

      {/* Like Button */}
      <TouchableOpacity
        style={[styles.button, styles.likeButton]}
        onPress={handleLike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={32} color="#00C853" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#00C853',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  superLikeButton: {
    borderWidth: 2,
    borderColor: '#00A8FF',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
