/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Uses NativeWind for styling with warm, approachable design.
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading spinner */
  loading?: boolean;
  /** Button text or content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-xl items-center justify-center flex-row active:opacity-80";

  const variantClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    outline: "border-2 border-primary-500 bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-red-500",
  };

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  const textColorClasses = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-primary-500",
    ghost: "text-primary-500",
    danger: "text-white",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinnerColor = variant === 'outline' || variant === 'ghost' ? '#FF6B6B' : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && "opacity-50",
        className
      )}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <Text className={cn("font-semibold", textColorClasses[variant], textSizeClasses[size])}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
