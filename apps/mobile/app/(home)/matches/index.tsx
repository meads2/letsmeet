/**
 * Matches Screen (Tab 2)
 *
 * List of matched users with chat preview
 */

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMatches } from '../../../hooks/use-matches';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MatchWithProfile } from '@letsmeet/shared';

export default function MatchesScreen() {
  const router = useRouter();
  const { data: matches, isLoading, error, refetch } = useMatches();

  const formatLastMessage = (match: MatchWithProfile) => {
    if (!match.lastMessageAt) {
      return 'Start a conversation!';
    }

    const date = new Date(match.lastMessageAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMatch = ({ item }: { item: MatchWithProfile }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
      onPress={() => router.push(`/(home)/matches/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Profile Photo */}
      <Avatar
        source={item.otherUser.photos[0]}
        initials={item.otherUser.displayName?.charAt(0)}
        size="md"
      />

      {/* Match Info */}
      <View className="flex-1 ml-4">
        <View className="flex-row items-center mb-1">
          <Text className="text-lg font-bold text-neutral-800 flex-1">
            {item.otherUser.displayName}
          </Text>
          {item.unreadCount > 0 && (
            <Badge variant="primary" size="sm">
              {item.unreadCount}
            </Badge>
          )}
        </View>

        <Text className="text-sm text-neutral-500 mb-1" numberOfLines={1}>
          {item.otherUser.bio || 'No bio yet'}
        </Text>

        <Text className="text-xs text-neutral-400">{formatLastMessage(item)}</Text>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color="#C4B8C8" className="ml-2" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="py-4 px-5 bg-white border-b border-neutral-200">
          <Text className="text-2xl font-bold text-neutral-800">Matches</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="py-4 px-5 bg-white border-b border-neutral-200">
          <Text className="text-2xl font-bold text-neutral-800">Matches</Text>
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-5xl mb-6">⚠️</Text>
          <Text className="text-2xl font-bold text-neutral-800 mb-8">
            Error Loading Matches
          </Text>
          <Button variant="primary" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="py-4 px-5 bg-white border-b border-neutral-200">
          <Text className="text-2xl font-bold text-neutral-800">Matches</Text>
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-5xl mb-6">💕</Text>
          <Text className="text-2xl font-bold text-neutral-800 mb-3">
            No Matches Yet
          </Text>
          <Text className="text-base text-neutral-500 text-center leading-6">
            When you match with someone,{'\n'}
            they&apos;ll appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="py-4 px-5 bg-white border-b border-neutral-200">
        <Text className="text-2xl font-bold text-neutral-800">Matches</Text>
        <Text className="text-sm text-neutral-500 mt-1">{matches.length} matches</Text>
      </View>

      {/* Matches List */}
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-3"
      />
    </SafeAreaView>
  );
}
