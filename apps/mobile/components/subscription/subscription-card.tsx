/**
 * Subscription Card Component
 *
 * Displays subscription tier with features and pricing
 */

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SubscriptionPlan } from '@letsmeet/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: () => void;
}

export function SubscriptionCard({ plan, isCurrentPlan, onSelect }: SubscriptionCardProps) {
  const isFree = plan.id === 'free';

  return (
    <Card
      variant="elevated"
      padding="lg"
      className={[
        'mx-4 my-2 relative',
        plan.popular ? 'border-2 border-primary-500' : '',
        isCurrentPlan ? 'border-2 border-green-500 bg-green-50' : '',
      ].join(' ')}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <View className="absolute -top-3 self-center">
          <Badge variant="warning" size="md">
            MOST POPULAR
          </Badge>
        </View>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <View className="flex-row items-center gap-1.5 mb-3">
          <Ionicons name="checkmark-circle" size={20} color="#00C853" />
          <Text className="text-green-600 text-sm font-bold">Current Plan</Text>
        </View>
      )}

      {/* Header */}
      <Text className="text-3xl font-bold text-neutral-900 mb-2">{plan.name}</Text>
      <View className="flex-row items-baseline mb-6">
        <Text className="text-3xl font-bold text-primary-500">{plan.priceDisplay}</Text>
        {!isFree && (
          <Text className="text-base text-neutral-500 ml-1">/month</Text>
        )}
      </View>

      {/* Features */}
      <View className="gap-3 mb-6">
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
        <Button
          variant={plan.popular ? 'primary' : 'outline'}
          size="lg"
          onPress={onSelect}
          className="w-full"
        >
          {isFree ? 'Current Plan' : 'Upgrade Now'}
        </Button>
      )}
    </Card>
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
    <View className="flex-row items-center gap-3">
      <Ionicons
        name={icon as any}
        size={18}
        color={highlighted ? '#FF6B6B' : '#9ca3af'}
      />
      <Text className={['flex-1 text-sm', highlighted ? 'text-neutral-900 font-semibold' : 'text-neutral-500'].join(' ')}>
        {text}
      </Text>
    </View>
  );
}
