/**
 * Avatar Component
 *
 * A user avatar component with image, fallback initials, and status indicators.
 * Uses NativeWind for styling with warm, friendly design.
 */

import React from 'react';
import { View, Text, Image, type ImageSourcePropType } from 'react-native';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  /** Avatar image source */
  source?: ImageSourcePropType | string;
  /** Fallback initials if no image */
  initials?: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show online indicator */
  online?: boolean;
  /** Show verified badge */
  verified?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Avatar({
  source,
  initials,
  size = 'md',
  online,
  verified,
  className,
}: AvatarProps) {
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const indicatorSizeClasses = {
    xs: "w-2 h-2",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View className={cn("relative", className)}>
      <View
        className={cn(
          "rounded-full overflow-hidden bg-primary-100 items-center justify-center",
          sizeClasses[size]
        )}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : initials ? (
          <Text className={cn("font-bold text-primary-700", textSizeClasses[size])}>
            {initials}
          </Text>
        ) : null}
      </View>

      {/* Online indicator */}
      {online && (
        <View
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white",
            indicatorSizeClasses[size]
          )}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <View
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-blue-500 border-2 border-white items-center justify-center",
            indicatorSizeClasses[size]
          )}
        >
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </View>
  );
}
