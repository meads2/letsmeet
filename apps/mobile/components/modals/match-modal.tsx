/**
 * Match Modal Component
 *
 * "It's a Match!" celebration modal
 */

import { Modal, View, Text } from 'react-native';
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
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
      <BlurView intensity={90} className="flex-1">
        <LinearGradient
          colors={['rgba(255, 107, 157, 0.95)', 'rgba(192, 108, 132, 0.95)']}
          className="flex-1 justify-center items-center"
        >
          <View className="items-center px-8">
            {/* Celebration Animation */}
            <Animated.View style={animatedStyle} className="mb-6">
              <Text className="text-[80px]">🎉</Text>
            </Animated.View>

            {/* Title */}
            <Text className="text-5xl font-bold text-white mb-3 text-center">
              It&apos;s a Match!
            </Text>
            <Text className="text-lg text-white/90 mb-10 text-center">
              You and {matchedUser.name} liked each other
            </Text>

            {/* Photos */}
            <View className="flex-row items-center mb-10">
              {currentUserPhoto && (
                <Avatar
                  source={currentUserPhoto}
                  size="xl"
                  className="border-4 border-white"
                />
              )}
              <View className="mx-5">
                <Ionicons name="heart" size={40} color="#FFFFFF" />
              </View>
              <Avatar
                source={matchedUser.photo}
                initials={matchedUser.name.charAt(0)}
                size="xl"
                className="border-4 border-white"
              />
            </View>

            {/* Actions */}
            <View className="w-full gap-4">
              {onSendMessage && (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={onSendMessage}
                  className="w-full bg-white"
                >
                  <Text className="text-primary-500 text-lg font-bold">Send Message</Text>
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onPress={onClose}
                className="w-full border-white"
              >
                <Text className="text-white text-lg font-semibold">Keep Swiping</Text>
              </Button>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Modal>
  );
}
