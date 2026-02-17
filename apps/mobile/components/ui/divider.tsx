/**
 * Divider Component
 *
 * A simple divider/separator component for visual separation.
 * Uses NativeWind for styling with warm, friendly design.
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface DividerProps extends ViewProps {
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Divider color */
  color?: 'light' | 'medium' | 'dark';
  /** Divider thickness */
  thickness?: 'thin' | 'medium' | 'thick';
  /** Additional CSS classes */
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  color = 'light',
  thickness = 'thin',
  className,
  ...props
}: DividerProps) {
  const orientationClasses = {
    horizontal: "w-full",
    vertical: "h-full",
  };

  const colorClasses = {
    light: "bg-neutral-200",
    medium: "bg-neutral-300",
    dark: "bg-neutral-400",
  };

  const thicknessClasses = {
    horizontal: {
      thin: "h-px",
      medium: "h-0.5",
      thick: "h-1",
    },
    vertical: {
      thin: "w-px",
      medium: "w-0.5",
      thick: "w-1",
    },
  };

  return (
    <View
      className={cn(
        orientationClasses[orientation],
        colorClasses[color],
        thicknessClasses[orientation][thickness],
        className
      )}
      {...props}
    />
  );
}
