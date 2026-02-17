/**
 * Message Bubble Component
 *
 * Displays individual chat messages
 */

import { View, Text, Image } from 'react-native';
import type { MessageWithSender } from '@letsmeet/shared';
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
      className={`flex-row my-1 px-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {/* Sender's avatar (only for other person's messages) */}
      {!isOwnMessage && message.sender.photos?.[0] && (
        <Image
          source={{ uri: message.sender.photos[0] }}
          className="w-8 h-8 rounded-full mr-2 bg-neutral-100"
        />
      )}

      <View className="max-w-[75%]">
        {/* Sender name (only for other person's messages) */}
        {!isOwnMessage && (
          <Text className="text-xs text-neutral-500 mb-1 ml-3">
            {message.sender.displayName}
          </Text>
        )}

        {/* Message bubble */}
        <View
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwnMessage
              ? 'bg-primary-500 rounded-br-sm'
              : 'bg-neutral-100 rounded-bl-sm'
          }`}
        >
          {/* Image message */}
          {message.type === 'image' && message.mediaUrl && (
            <Image
              source={{ uri: message.mediaUrl }}
              className="w-48 h-48 rounded-xl"
              resizeMode="cover"
            />
          )}

          {/* Text message */}
          {message.type === 'text' && (
            <Text
              className={`text-base leading-snug ${
                isOwnMessage ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {message.content}
            </Text>
          )}

          {/* GIF message */}
          {message.type === 'gif' && message.mediaUrl && (
            <Image
              source={{ uri: message.mediaUrl }}
              className="w-36 h-36 rounded-xl"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Timestamp */}
        <Text
          className={`text-xs text-neutral-400 mt-1 ${
            isOwnMessage ? 'text-right mr-3' : 'text-left ml-3'
          }`}
        >
          {formatTime(message.createdAt)}
          {isOwnMessage && message.readAt && ' • Read'}
        </Text>
      </View>
    </View>
  );
}
