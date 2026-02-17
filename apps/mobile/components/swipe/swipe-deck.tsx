/**
 * Swipe Deck Component
 *
 * Main swipeable card deck using react-native-deck-swiper
 */

import { useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ProfileCard } from './profile-card';
import { ActionButtons } from './action-buttons';
import type { ProfileModel } from '@letsmeet/shared';

interface SwipeDeckProps {
  profiles: ProfileModel[];
  onSwipeLeft: (profile: ProfileModel) => void;
  onSwipeRight: (profile: ProfileModel) => void;
  onSwipeTop: (profile: ProfileModel) => void;
  isLoading?: boolean;
}

export function SwipeDeck({
  profiles,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
  isLoading = false,
}: SwipeDeckProps) {
  const swiperRef = useRef<any>(null);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text className="mt-4 text-base text-neutral-600">Loading profiles...</Text>
      </View>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-10">
        <Text className="text-8xl mb-6">🔍</Text>
        <Text className="text-2xl font-bold text-neutral-800 mb-3">No More Profiles</Text>
        <Text className="text-base text-neutral-600 text-center leading-6">
          You&apos;ve seen everyone nearby!{'\n'}
          Try adjusting your preferences or check back later.
        </Text>
      </View>
    );
  }

  const handleSwipeLeft = (cardIndex: number) => {
    onSwipeLeft(profiles[cardIndex]);
  };

  const handleSwipeRight = (cardIndex: number) => {
    onSwipeRight(profiles[cardIndex]);
  };

  const handleSwipeTop = (cardIndex: number) => {
    onSwipeTop(profiles[cardIndex]);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <Swiper
        ref={swiperRef}
        cards={profiles}
        renderCard={(profile) => <ProfileCard profile={profile} />}
        onSwipedLeft={handleSwipeLeft}
        onSwipedRight={handleSwipeRight}
        onSwipedTop={handleSwipeTop}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackScale={10}
        stackSeparation={14}
        disableBottomSwipe
        animateCardOpacity
        animateOverlayLabelsOpacity
        overlayLabels={{
          left: {
            title: 'PASS',
            style: {
              label: {
                backgroundColor: '#FF3B30',
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 8,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: {
                backgroundColor: '#00C853',
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 8,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
          top: {
            title: 'SUPER LIKE',
            style: {
              label: {
                backgroundColor: '#00A8FF',
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 'bold',
                borderRadius: 8,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          },
        }}
        overlayOpacityHorizontalThreshold={0.3}
        overlayOpacityVerticalThreshold={0.3}
      />

      <ActionButtons
        onPass={() => swiperRef.current?.swipeLeft()}
        onLike={() => swiperRef.current?.swipeRight()}
        onSuperLike={() => swiperRef.current?.swipeTop()}
      />
    </View>
  );
}
