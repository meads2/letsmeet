/**
 * Chat Interface Component
 *
 * Complete chat UI with message list and input
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from './message-bubble';
import { useMessages, useSendMessage, useMarkAsRead } from '../../hooks/use-messages';
import type { MessageWithSender } from '@letsmeet/shared';

interface ChatInterfaceProps {
  matchId: string;
  receiverId: string;
}

export function ChatInterface({ matchId, receiverId }: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useMessages(matchId, true);
  const sendMutation = useSendMessage(matchId);
  const markAsReadMutation = useMarkAsRead(matchId);

  // Mark messages as read when component mounts or new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  const handleSend = async () => {
    const trimmedText = messageText.trim();
    if (!trimmedText || sendMutation.isPending) return;

    // Clear input immediately for better UX
    setMessageText('');

    try {
      await sendMutation.mutateAsync({
        receiverId,
        content: trimmedText,
        type: 'text',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(trimmedText);
    }
  };

  const renderMessage = ({ item }: { item: MessageWithSender }) => (
    <MessageBubble message={item} />
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Input Area */}
      <View className="bg-white border-t border-neutral-200 px-4 py-3">
        <View className="flex-row items-end gap-2">
          <TextInput
            className="flex-1 bg-neutral-100 rounded-2xl px-4 py-2.5 text-base text-neutral-900 max-h-24"
            placeholder="Type a message..."
            placeholderTextColor="#A3A3A3"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              !messageText.trim() ? 'bg-neutral-300' : 'bg-primary-500'
            }`}
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
