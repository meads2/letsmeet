/**
 * Explore Screen (Tab 1)
 *
 * Swipeable feed of potential matches
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SwipeDeck } from '../../components/swipe/swipe-deck';
import { MatchModal } from '../../components/modals/match-modal';
import { useFeed, useFeedCount } from '../../hooks/use-feed';
import { useSwipe } from '../../hooks/use-swipe';
import { getProfileByUserId } from '../../api/database/queries/profiles';
import { useAuth } from '@clerk/clerk-expo';
import { useHasFeature, useDailyLikesLimit } from '../../hooks/use-subscription';
import { preloadFeedImages } from '../../api/utils/image-preloader';
import type { FeedProfile } from '../../api/database/queries/feed';

export default function ExploreScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { data: profiles, isLoading, error, refetch } = useFeed(20);
  const { data: feedCount } = useFeedCount();
  const {
    swipeLeft,
    swipeRight,
    superLike,
    matchResult,
    clearMatchResult,
  } = useSwipe();

  const canSeeWhoLikedYou = useHasFeature('canSeeWhoLikedYou');
  const dailyLimit = useDailyLikesLimit();

  // Preload images when profiles load
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      preloadFeedImages(profiles);
    }
  }, [profiles]);

  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>();
  const [matchedUserInfo, setMatchedUserInfo] = useState<{
    name: string;
    photo: string;
  }>();

  // Load current user's profile photo
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (!userId) return;
      const profile = await getProfileByUserId(userId);
      if (profile?.photos?.[0]) {
        setCurrentUserPhoto(profile.photos[0]);
      }
    };
    loadUserPhoto();
  }, [userId]);

  // Handle match result
  useEffect(() => {
    if (matchResult?.isMatch && profiles) {
      // Find the matched user from profiles
      const lastSwipedProfile = profiles[0]; // Assuming we just swiped
      if (lastSwipedProfile) {
        setMatchedUserInfo({
          name: lastSwipedProfile.displayName,
          photo: lastSwipedProfile.photos[0],
        });
      }
    }
  }, [matchResult, profiles]);

  const handleSwipeLeft = (profile: FeedProfile) => {
    swipeLeft(profile.userId);
  };

  const handleSwipeRight = (profile: FeedProfile) => {
    swipeRight(profile.userId);
  };

  const handleSuperLike = (profile: FeedProfile) => {
    superLike(profile.userId);
  };

  const handleSendMessage = () => {
    if (matchResult?.matchId) {
      clearMatchResult();
      router.push(`/(tabs)/matches/${matchResult.matchId}`);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSeeWhoLikedYou = () => {
    if (!canSeeWhoLikedYou) {
      Alert.alert(
        'Premium Feature',
        'See who liked you is a Premium feature. Upgrade to see everyone who already liked you!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/marketplace') },
        ]
      );
      return;
    }

    // TODO: Navigate to "Who Liked You" screen
    Alert.alert('Coming Soon', 'This feature is coming soon!');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>💕 LetsMeet</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>
            Something went wrong loading profiles.{'\n'}
            Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💕 LetsMeet</Text>
        <View style={styles.headerRight}>
          {/* Daily Likes Counter */}
          {dailyLimit !== 'unlimited' && (
            <View style={styles.likesCounter}>
              <Ionicons name="heart" size={16} color="#FF6B9D" />
              <Text style={styles.likesText}>{dailyLimit} left</Text>
            </View>
          )}

          {/* See Who Liked You Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSeeWhoLikedYou}
          >
            <Ionicons
              name="star"
              size={24}
              color={canSeeWhoLikedYou ? '#FF6B9D' : '#CCC'}
            />
          </TouchableOpacity>

          {/* Feed Count */}
          {feedCount !== undefined && feedCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{feedCount}</Text>
            </View>
          )}

          {/* Settings */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Deck */}
      <View style={styles.content}>
        <SwipeDeck
          profiles={profiles || []}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeTop={handleSuperLike}
          isLoading={isLoading}
        />
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={!!matchResult?.isMatch}
        onClose={clearMatchResult}
        onSendMessage={handleSendMessage}
        matchedUser={matchedUserInfo}
        currentUserPhoto={currentUserPhoto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likesCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  likesText: {
    color: '#FF6B9D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 4,
  },
  countBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
