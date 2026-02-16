/**
 * Profile Card Component
 *
 * Displays profile information in swipeable card format
 */

import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { FeedProfile } from '../../api/database/queries/feed';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

interface ProfileCardProps {
  profile: FeedProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const primaryPhoto = profile.photos[0];
  const age = profile.age;
  const distance = profile.distance ? `${profile.distance}km away` : null;

  return (
    <View style={styles.card}>
      {/* Photo */}
      <Image
        source={{ uri: primaryPhoto }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Name and Age */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile.displayName}, {age}
          </Text>
          {profile.relationshipGoal && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {getGoalIcon(profile.relationshipGoal)}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        {(profile.city || distance) && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#FFFFFF" />
            <Text style={styles.location}>
              {profile.city}
              {profile.city && distance ? ' • ' : ''}
              {distance}
            </Text>
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.interestsContainer}
            contentContainerStyle={styles.interestsContent}
          >
            {profile.interests.slice(0, 5).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Mutual Interests */}
        {profile.mutualInterests && profile.mutualInterests.length > 0 && (
          <View style={styles.mutualContainer}>
            <Ionicons name="heart" size={16} color="#FF6B9D" />
            <Text style={styles.mutualText}>
              {profile.mutualInterests.length} shared interest
              {profile.mutualInterests.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Photo indicator dots */}
      {profile.photos.length > 1 && (
        <View style={styles.photoIndicators}>
          {profile.photos.map((_, index) => (
            <View
              key={index}
              style={[styles.indicator, index === 0 && styles.indicatorActive]}
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

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  bio: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  interestsContainer: {
    marginBottom: 12,
  },
  interestsContent: {
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  interestText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mutualText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  photoIndicators: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
  },
});
