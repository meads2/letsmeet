/**
 * Subscription Card Component
 *
 * Displays subscription tier with features and pricing
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SubscriptionPlan } from '../../api/payments/subscription-config';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: () => void;
}

export function SubscriptionCard({ plan, isCurrentPlan, onSelect }: SubscriptionCardProps) {
  const isFree = plan.id === 'free';

  return (
    <View
      style={[
        styles.card,
        plan.popular && styles.popularCard,
        isCurrentPlan && styles.currentCard,
      ]}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <View style={styles.currentBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#00C853" />
          <Text style={styles.currentText}>Current Plan</Text>
        </View>
      )}

      {/* Header */}
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{plan.priceDisplay}</Text>
        {!isFree && <Text style={styles.interval}>/month</Text>}
      </View>

      {/* Features */}
      <View style={styles.features}>
        {/* Likes */}
        <Feature
          icon="heart"
          text={
            plan.features.dailyLikesLimit === 'unlimited'
              ? 'Unlimited likes'
              : `${plan.features.dailyLikesLimit} likes per day`
          }
          highlighted={plan.features.dailyLikesLimit === 'unlimited'}
        />

        {/* Super Likes */}
        {plan.features.superLikesPerWeek > 0 && (
          <Feature
            icon="star"
            text={`${plan.features.superLikesPerWeek} Super Likes per week`}
            highlighted
          />
        )}

        {/* See Who Liked You */}
        {plan.features.canSeeWhoLikedYou && (
          <Feature icon="eye" text="See who liked you" highlighted />
        )}

        {/* Rewind */}
        {plan.features.canRewindSwipes && (
          <Feature icon="arrow-undo" text="Rewind last swipe" highlighted />
        )}

        {/* Boosts */}
        {plan.features.boostsPerMonth > 0 && (
          <Feature
            icon="flash"
            text={`${plan.features.boostsPerMonth} Boost${
              plan.features.boostsPerMonth > 1 ? 's' : ''
            } per month`}
            highlighted
          />
        )}

        {/* Advanced Filters */}
        {plan.features.hasAdvancedFilters && (
          <Feature icon="options" text="Advanced filters" highlighted />
        )}

        {/* Priority */}
        {plan.features.isPriorityInFeed && (
          <Feature icon="trending-up" text="Priority in feed" highlighted />
        )}

        {/* GIFs */}
        {plan.features.canSendGifs && (
          <Feature icon="happy" text="Send GIFs in chat" highlighted />
        )}
      </View>

      {/* CTA Button */}
      {!isCurrentPlan && (
        <TouchableOpacity
          style={[styles.button, plan.popular && styles.popularButton]}
          onPress={onSelect}
        >
          <Text style={[styles.buttonText, plan.popular && styles.popularButtonText]}>
            {isFree ? 'Current Plan' : 'Upgrade Now'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Feature({
  icon,
  text,
  highlighted,
}: {
  icon: string;
  text: string;
  highlighted?: boolean;
}) {
  return (
    <View style={styles.feature}>
      <Ionicons
        name={icon as any}
        size={18}
        color={highlighted ? '#FF6B9D' : '#666'}
      />
      <Text style={[styles.featureText, highlighted && styles.featureTextHighlighted]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCard: {
    borderColor: '#FF6B9D',
    borderWidth: 3,
  },
  currentCard: {
    borderColor: '#00C853',
    backgroundColor: '#F0FFF4',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  currentText: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  interval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  featureTextHighlighted: {
    color: '#333',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#FF6B9D',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  popularButtonText: {
    color: '#FFFFFF',
  },
});
