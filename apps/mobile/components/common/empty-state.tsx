/**
 * Empty State Component
 *
 * Consistent empty state UI across the app
 */

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: string;
  emoji?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {emoji && (
        <Text className="text-[80px] mb-6">{emoji}</Text>
      )}
      {icon && !emoji && (
        <Ionicons name={icon as any} size={80} color="#e5e7eb" />
      )}
      <Text className="text-xl font-bold text-neutral-700 mt-6 mb-3 text-center">
        {title}
      </Text>
      <Text className="text-base text-neutral-500 text-center leading-6 mb-8">
        {description}
      </Text>
      {actionText && onAction && (
        <Button variant="primary" size="md" onPress={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  );
}
