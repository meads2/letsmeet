/**
 * Message Model
 *
 * Chat messages between matched users
 */

export interface MessageModel {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'gif';
  mediaUrl?: string; // For image/gif messages
  readAt?: Date;
  createdAt: Date;
}

export type CreateMessageInput = Omit<MessageModel, 'id' | 'createdAt' | 'readAt'>;
export type UpdateMessageInput = Partial<Pick<MessageModel, 'readAt'>>;

/**
 * Message with sender details (for UI display)
 */
export interface MessageWithSender extends MessageModel {
  sender: {
    displayName: string;
    photos: string[];
  };
}
