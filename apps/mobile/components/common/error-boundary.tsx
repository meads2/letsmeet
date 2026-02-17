/**
 * Error Boundary Component
 *
 * Catches and handles React errors gracefully
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-6 bg-white">
          <Ionicons name="warning" size={64} color="#FF6B6B" />
          <Text className="text-2xl font-bold text-neutral-800 mt-6 mb-3 text-center">
            Oops! Something went wrong
          </Text>
          <Text className="text-base text-neutral-500 text-center mb-8 leading-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            className="bg-primary-500 py-3 px-8 rounded-xl"
            onPress={this.handleReset}
          >
            <Text className="text-white text-base font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

