/**
 * Explore Screen (Tab 1)
 *
 * Swipeable feed of potential matches
 */

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SwipeDeck } from '../../components/swipe/swipe-deck';
import { MatchModal } from '../../components/modals/match-modal';
import { useFeed, useFeedCount } from '../../hooks/use-feed';
import { useSwipe } from '../../hooks/use-swipe';
import { useHasFeature, useDailyLikesLimit } from '../../hooks/use-subscription';
import { useProfile } from '../../hooks/use-profile';
import { Button } from '../../components/ui';
import type { ProfileModel } from '@letsmeet/shared';

export default function ExploreScreen() {
  const router = useRouter();
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
  const { data: currentUserProfile } = useProfile();

  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>();
  const [matchedUserInfo, setMatchedUserInfo] = useState<{
    name: string;
    photo: string;
  }>();

  // Load current user's profile photo
  useEffect(() => {
    if (currentUserProfile?.photos?.[0]) {
      setCurrentUserPhoto(currentUserProfile.photos[0]);
    }
  }, [currentUserProfile]);

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

  const handleSwipeLeft = (profile: ProfileModel) => {
    swipeLeft(profile.userId);
  };

  const handleSwipeRight = (profile: ProfileModel) => {
    swipeRight(profile.userId);
  };

  const handleSuperLike = (profile: ProfileModel) => {
    superLike(profile.userId);
  };

  const handleSendMessage = () => {
    if (matchResult?.matchId) {
      clearMatchResult();
      router.push(`/(home)/matches/${matchResult.matchId}`);
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
          { text: 'Upgrade', onPress: () => router.push('/(home)/profile') },
        ]
      );
      return;
    }

    // TODO: Navigate to "Who Liked You" screen
    Alert.alert('Coming Soon', 'This feature is coming soon!');
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100">
        <View className="flex-row justify-between items-center py-4 px-5 bg-white border-b border-neutral-200">
          <Text className="text-2xl font-bold text-primary-500">💕 LetsMeet</Text>
        </View>
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-8xl mb-6">⚠️</Text>
          <Text className="text-2xl font-bold text-neutral-800 mb-3">Oops!</Text>
          <Text className="text-base text-neutral-500 text-center leading-6 mb-8">
            Something went wrong loading profiles.{'\n'}
            Please try again.
          </Text>
          <Button variant="primary" size="lg" onPress={handleRefresh}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {/* Header */}
      <View className="flex-row justify-between items-center py-4 px-5 bg-white border-b border-neutral-200">
        <Text className="text-2xl font-bold text-primary-500">💕 LetsMeet</Text>
        <View className="flex-row items-center gap-3">
          {/* Daily Likes Counter */}
          {dailyLimit !== 'unlimited' && (
            <View className="flex-row items-center bg-pink-50 px-3 py-1.5 rounded-xl gap-1">
              <Ionicons name="heart" size={16} color="#FF6B6B" />
              <Text className="text-primary-500 text-xs font-bold">{dailyLimit} left</Text>
            </View>
          )}

          {/* See Who Liked You Button */}
          <TouchableOpacity className="p-1" onPress={handleSeeWhoLikedYou}>
            <Ionicons
              name="star"
              size={24}
              color={canSeeWhoLikedYou ? '#FF6B6B' : '#CCC'}
            />
          </TouchableOpacity>

          {/* Feed Count */}
          {feedCount !== undefined && feedCount > 0 && (
            <View className="bg-primary-500 px-3 py-1 rounded-xl">
              <Text className="text-white text-sm font-bold">{feedCount}</Text>
            </View>
          )}

          {/* Settings */}
          <TouchableOpacity onPress={() => router.push('/(home)/profile')}>
            <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Deck */}
      <View className="flex-1 pt-5">
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
