import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExploreScreen() {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FFA07A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center"
      >
        <View className="items-center p-5">
          <Ionicons name="compass" size={80} color="white" style={{ opacity: 0.9, marginBottom: 20 }} />
          <Text className="text-4xl font-bold text-white mb-2 text-center">
            Explore Trending
          </Text>
          <Text className="text-2xl font-semibold text-white mb-4 text-center" style={{ opacity: 0.9 }}>
            Coming Soon
          </Text>
          <Text className="text-base text-white text-center leading-6" style={{ opacity: 0.8 }}>
            Discover trending profiles in your area{'\n'}
            with pay-to-match features
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
