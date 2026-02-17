/**
 * Card Component
 *
 * A container component with multiple visual variants.
 * Uses NativeWind for styling with warm, friendly design.
 */

import React from 'react';
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<ViewProps, 'children'> {
  /** Card style variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the card is pressable */
  onPress?: PressableProps['onPress'];
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Card({
  variant = 'default',
  padding = 'md',
  onPress,
  children,
  className,
  ...props
}: CardProps) {
  const baseClasses = "rounded-2xl bg-white";

  const variantClasses = {
    default: "",
    elevated: "shadow-md",
    outlined: "border-2 border-neutral-200",
    glass: "bg-white/80 backdrop-blur",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const combinedClassName = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  // If onPress is provided, render as Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(combinedClassName, "active:opacity-80")}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, render as View
  return (
    <View className={combinedClassName} {...props}>
      {children}
    </View>
  );
}
