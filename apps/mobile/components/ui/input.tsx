/**
 * Input Component
 *
 * A text input component with label, error message, and icon support.
 * Uses NativeWind for styling with warm, friendly design.
 */

import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  /** Input label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below input */
  helperText?: string;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Container CSS classes */
  containerClassName?: string;
  /** Input CSS classes */
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const inputBorderClasses = error
    ? "border-red-500"
    : "border-neutral-300 focus:border-primary-500";

  return (
    <View className={cn("w-full", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}

      <View
        className={cn(
          "flex-row items-center border-2 rounded-xl px-4 bg-white",
          inputBorderClasses
        )}
      >
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        <TextInput
          className={cn(
            "flex-1 py-3 text-base text-neutral-900",
            className
          )}
          placeholderTextColor="#ADB5BD"
          {...props}
        />

        {rightIcon && (
          <View className="ml-3">
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text className="text-sm text-neutral-500 mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
}
