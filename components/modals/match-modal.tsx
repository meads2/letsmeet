/**
 * Match Modal Component
 *
 * "It's a Match!" celebration modal
 */

import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSendMessage?: () => void;
  matchedUser?: {
    name: string;
    photo: string;
  };
  currentUserPhoto?: string;
}

export function MatchModal({
  visible,
  onClose,
  onSendMessage,
  matchedUser,
  currentUserPhoto,
}: MatchModalProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      scale.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!matchedUser) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(255, 107, 157, 0.95)', 'rgba(192, 108, 132, 0.95)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Celebration Animation */}
            <Animated.View style={[styles.celebrationContainer, animatedStyle]}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>It&apos;s a Match!</Text>
            <Text style={styles.subtitle}>
              You and {matchedUser.name} liked each other
            </Text>

            {/* Photos */}
            <View style={styles.photosContainer}>
              {currentUserPhoto && (
                <View style={styles.photoWrapper}>
                  <Image
                    source={{ uri: currentUserPhoto }}
                    style={styles.photo}
                  />
                </View>
              )}
              <View style={styles.heartContainer}>
                <Ionicons name="heart" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: matchedUser.photo }}
                  style={styles.photo}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onSendMessage && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onSendMessage}
                >
                  <Text style={styles.primaryButtonText}>Send Message</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  celebrationContainer: {
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  heartContainer: {
    marginHorizontal: 20,
  },
  actions: {
    width: '100%',
    gap: 16,
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
});
