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
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from './message-bubble';
import { useMessages, useSendMessage, useMarkAsRead } from '../../hooks/use-messages';
import type { MessageWithSender } from '../../api/database/models/message';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
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
  messageList: {
    paddingVertical: 16,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});
