/**
 * Message Bubble Component
 *
 * Displays individual chat messages
 */

import { View, Text, StyleSheet, Image } from 'react-native';
import type { MessageWithSender } from '../../api/database/models/message';
import { useAuth } from '@clerk/clerk-expo';

interface MessageBubbleProps {
  message: MessageWithSender;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { userId } = useAuth();
  const isOwnMessage = message.senderId === userId;

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {/* Sender's avatar (only for other person's messages) */}
      {!isOwnMessage && message.sender.photos?.[0] && (
        <Image
          source={{ uri: message.sender.photos[0] }}
          style={styles.avatar}
        />
      )}

      <View style={styles.messageWrapper}>
        {/* Sender name (only for other person's messages) */}
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.sender.displayName}</Text>
        )}

        {/* Message bubble */}
        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {/* Image message */}
          {message.type === 'image' && message.mediaUrl && (
            <Image
              source={{ uri: message.mediaUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}

          {/* Text message */}
          {message.type === 'text' && (
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {message.content}
            </Text>
          )}

          {/* GIF message */}
          {message.type === 'gif' && message.mediaUrl && (
            <Image
              source={{ uri: message.mediaUrl }}
              style={styles.messageGif}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}
        >
          {formatTime(message.createdAt)}
          {isOwnMessage && message.readAt && ' • Read'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ownBubble: {
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageGif: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: '#999',
    textAlign: 'right',
    marginRight: 12,
  },
  otherTimestamp: {
    color: '#999',
    textAlign: 'left',
    marginLeft: 12,
  },
});
