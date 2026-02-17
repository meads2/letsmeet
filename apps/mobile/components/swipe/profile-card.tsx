/**
 * Profile Card Component
 *
 * Displays profile information in swipeable card format
 */

import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ProfileModel } from '@letsmeet/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

interface ProfileCardProps {
  profile: ProfileModel;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const primaryPhoto = profile.photos[0];
  const age = profile.age;
  // Optional fields from feed that may not be on base ProfileModel
  const distance = (profile as any).distance ? `${(profile as any).distance}km away` : null;

  return (
    <View
      className="overflow-hidden rounded-3xl bg-white shadow-lg"
      style={{ width: SCREEN_WIDTH - 40, height: CARD_HEIGHT }}
    >
      {/* Photo - full bleed */}
      <Image
        source={{ uri: primaryPhoto }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }}
      />

      {/* Content overlay */}
      <View className="absolute bottom-0 left-0 right-0 p-5">
        {/* Name and Age */}
        <View className="flex-row items-center mb-2">
          <Text className="text-3xl font-bold text-white flex-1">
            {profile.displayName}, {age}
          </Text>
          {profile.relationshipGoal && (
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Text className="text-xl">
                {getGoalIcon(profile.relationshipGoal)}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        {(profile.city || distance) && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={16} color="#FFFFFF" />
            <Text className="text-base text-white ml-1" style={{ opacity: 0.9 }}>
              {profile.city}
              {profile.city && distance ? ' • ' : ''}
              {distance}
            </Text>
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <Text className="text-sm text-white leading-6 mb-3" numberOfLines={3}>
            {profile.bio}
          </Text>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8 }}
          >
            {profile.interests.slice(0, 5).map((interest, index) => (
              <View
                key={index}
                className="px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <Text className="text-sm text-white font-semibold">{interest}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Mutual Interests */}
        {(profile as any).mutualInterests && (profile as any).mutualInterests.length > 0 && (
          <View
            className="flex-row items-center self-start px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 107, 157, 0.2)' }}
          >
            <Ionicons name="heart" size={16} color="#FF6B9D" />
            <Text className="text-sm text-white font-semibold ml-1.5">
              {(profile as any).mutualInterests.length} shared interest
              {(profile as any).mutualInterests.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Photo indicator dots */}
      {profile.photos.length > 1 && (
        <View className="absolute top-4 left-0 right-0 flex-row justify-center" style={{ gap: 6 }}>
          {profile.photos.map((_, index) => (
            <View
              key={index}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: index === 0
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.4)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function getGoalIcon(goal: string): string {
  switch (goal) {
    case 'relationship':
      return '💕';
    case 'casual':
      return '✨';
    case 'friendship':
      return '👋';
    case 'unsure':
      return '🤷';
    default:
      return '💬';
  }
}
