/**
 * Chat Screen
 *
 * One-on-one chat with a matched user
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatInterface } from '../../../components/chat/chat-interface';
import { getMatchById } from '../../../api/database/queries/matches';
import { getProfileByUserId } from '../../../api/database/queries/profiles';
import { useAuth } from '@clerk/clerk-expo';
import type { MatchModel } from '../../../api/database/models/match';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();

  const matchId = params.matchId as string;
  const [match, setMatch] = useState<MatchModel | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [otherUserPhoto, setOtherUserPhoto] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, userId]);

  const loadMatchData = async () => {
    try {
      if (!userId || !matchId) return;

      const matchData = await getMatchById(matchId);
      if (!matchData) {
        Alert.alert('Error', 'Match not found');
        router.back();
        return;
      }

      setMatch(matchData);

      // Determine the other user's ID
      const otherUserId = matchData.user1Id === userId ? matchData.user2Id : matchData.user1Id;
      setReceiverId(otherUserId);

      // Load other user's profile
      const profile = await getProfileByUserId(otherUserId);
      if (profile) {
        setOtherUserName(profile.displayName);
        setOtherUserPhoto(profile.photos[0] || '');
      }
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match || !receiverId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Match not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerCenter} onPress={showOptions}>
          {otherUserPhoto ? (
            <Image source={{ uri: otherUserPhoto }} style={styles.headerPhoto} />
          ) : null}
          <Text style={styles.headerName}>{otherUserName}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showOptions} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chat Interface */}
      <ChatInterface matchId={matchId} receiverId={receiverId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  moreButton: {
    padding: 4,
  },
});
