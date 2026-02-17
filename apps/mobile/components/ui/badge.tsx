/**
 * Badge Component
 *
 * A small label component for displaying tags, status, or counts.
 * Uses NativeWind for styling with warm, friendly design.
 */

import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  /** Badge style variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Badge text content */
  children: React.ReactNode;
  /** Optional icon to display before text */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Badge({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = "rounded-full flex-row items-center justify-center";

  const variantClasses = {
    primary: "bg-primary-100",
    secondary: "bg-secondary-100",
    success: "bg-green-100",
    warning: "bg-accent-100",
    danger: "bg-red-100",
    neutral: "bg-neutral-100",
  };

  const textColorClasses = {
    primary: "text-primary-700",
    secondary: "text-secondary-700",
    success: "text-green-700",
    warning: "text-accent-700",
    danger: "text-red-700",
    neutral: "text-neutral-700",
  };

  const sizeClasses = {
    sm: "px-2 py-1",
    md: "px-3 py-1",
    lg: "px-4 py-2",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={cn("font-semibold", textColorClasses[variant], textSizeClasses[size])}>
        {children}
      </Text>
    </View>
  );
}
