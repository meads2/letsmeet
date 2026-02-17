/**
 * Chat Screen
 *
 * One-on-one chat with a matched user
 */

import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatInterface } from '../../../components/chat/chat-interface';
import { useMatches } from '../../../hooks/use-matches';
import { Avatar } from '@/components/ui/avatar';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const matchId = params.matchId as string;
  const { data: matches, isLoading: loading } = useMatches();

  // Find the specific match from the list
  const match = matches?.find((m) => m.id === matchId);

  // Determine the other user's info from the match
  const otherUser = match?.otherUser;
  const otherUserName = otherUser?.displayName || '';
  const otherUserPhoto = otherUser?.photos?.[0] || '';
  const receiverId = otherUser?.id || '';

  useEffect(() => {
    if (!loading && !match) {
      Alert.alert('Error', 'Match not found');
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, loading]);

  const handleUnmatch = () => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${otherUserName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement unmatch functionality
            router.back();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'What would you like to report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate behavior', onPress: () => {} },
        { text: 'Spam or scam', onPress: () => {} },
        { text: 'Fake profile', onPress: () => {} },
      ]
    );
  };

  const showOptions = () => {
    Alert.alert(
      otherUserName,
      'What would you like to do?',
      [
        { text: 'View Profile', onPress: () => {} },
        { text: 'Report', onPress: handleReport, style: 'destructive' },
        { text: 'Unmatch', onPress: handleUnmatch, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match || !receiverId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-neutral-400">Match not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-neutral-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center ml-3"
          onPress={showOptions}
          activeOpacity={0.7}
        >
          <Avatar
            source={otherUserPhoto || undefined}
            initials={otherUserName?.charAt(0)}
            size="sm"
          />
          <Text className="text-lg font-bold text-neutral-800 ml-3">
            {otherUserName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showOptions} className="p-1">
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chat Interface */}
      <ChatInterface matchId={matchId} receiverId={receiverId} />
    </SafeAreaView>
  );
}
