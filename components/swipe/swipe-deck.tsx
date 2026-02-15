/**
 * Swipe Deck Component
 *
 * Main swipeable card deck using react-native-deck-swiper
 */

import { useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { ProfileCard } from './profile-card';
import { ActionButtons } from './action-buttons';
import type { FeedProfile } from '../../api/database/queries/feed';

interface SwipeDeckProps {
  profiles: FeedProfile[];
  onSwipeLeft: (profile: FeedProfile) => void;
  onSwipeRight: (profile: FeedProfile) => void;
  onSwipeTop: (profile: FeedProfile) => void;
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptyText}>
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
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
