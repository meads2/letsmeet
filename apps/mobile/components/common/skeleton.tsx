/**
 * Skeleton Loading Components
 *
 * Placeholder components for loading states
 */

import { useEffect } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#e5e7eb',
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProfileCardSkeleton() {
  return (
    <View className="p-5">
      <Skeleton width="100%" height={400} borderRadius={20} />
      <View className="mt-4">
        <Skeleton width={200} height={32} borderRadius={8} />
        <Skeleton width={150} height={20} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={60} borderRadius={8} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

export function MatchCardSkeleton() {
  return (
    <View className="flex-row items-center bg-white p-4 rounded-xl mb-3">
      <Skeleton width={60} height={60} borderRadius={30} />
      <View className="flex-1 ml-4">
        <Skeleton width={120} height={20} borderRadius={6} />
        <Skeleton width={180} height={16} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width={80} height={14} borderRadius={6} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <View className={['flex-row my-2 px-3', isOwn ? 'justify-end' : ''].join(' ')}>
      {!isOwn && (
        <Skeleton width={32} height={32} borderRadius={16} style={{ marginRight: 8 }} />
      )}
      <View>
        <Skeleton
          width={isOwn ? 180 : 200}
          height={40}
          borderRadius={20}
        />
        <Skeleton
          width={60}
          height={12}
          borderRadius={6}
          style={{ marginTop: 4, alignSelf: isOwn ? 'flex-end' : 'flex-start' }}
        />
      </View>
    </View>
  );
}
