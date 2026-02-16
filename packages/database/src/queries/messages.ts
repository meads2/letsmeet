/**
 * Message Queries
 *
 * Chat message operations
 */

import { query, queryOne } from '../client';
import type { MessageModel, CreateMessageInput, MessageWithSender } from '@letsmeet/shared';
import { updateLastMessageAt } from './matches';

/**
 * Create a new message
 */
export const createMessage = async (input: CreateMessageInput): Promise<MessageModel> => {
  const message = await queryOne<MessageModel>(
    `INSERT INTO messages (match_id, sender_id, receiver_id, content, type, media_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [input.matchId, input.senderId, input.receiverId, input.content, input.type, input.mediaUrl]
  );

  if (!message) {
    throw new Error('Failed to create message');
  }

  // Update match's last_message_at
  await updateLastMessageAt(input.matchId, message.createdAt);

  return message;
};

/**
 * Get messages for a match
 */
export const getMatchMessages = async (
  matchId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageWithSender[]> => {
  const messages = await query<any>(
    `SELECT
       m.*,
       p.display_name as sender_display_name,
       p.photos as sender_photos
     FROM messages m
     INNER JOIN profiles p ON p.user_id = m.sender_id
     WHERE m.match_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [matchId, limit, offset]
  );

  return messages.map(m => ({
    id: m.id,
    matchId: m.match_id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    content: m.content,
    type: m.type,
    mediaUrl: m.media_url,
    readAt: m.read_at,
    createdAt: m.created_at,
    sender: {
      displayName: m.sender_display_name,
      photos: m.sender_photos,
    },
  }));
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  await query(
    `UPDATE messages
     SET read_at = NOW()
     WHERE id = $1 AND read_at IS NULL`,
    [messageId]
  );
};

/**
 * Mark all messages in a match as read
 */
export const markMatchMessagesAsRead = async (matchId: string, userId: string): Promise<void> => {
  await query(
    `UPDATE messages
     SET read_at = NOW()
     WHERE match_id = $1
       AND receiver_id = $2
       AND read_at IS NULL`,
    [matchId, userId]
  );
};

/**
 * Get unread message count for a match
 */
export const getUnreadCount = async (matchId: string, userId: string): Promise<number> => {
  const result = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM messages
     WHERE match_id = $1
       AND receiver_id = $2
       AND read_at IS NULL`,
    [matchId, userId]
  );

  return result?.count || 0;
};

/**
 * Get total unread message count for a user
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  const result = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM messages
     WHERE receiver_id = $1
       AND read_at IS NULL`,
    [userId]
  );

  return result?.count || 0;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  // Only allow sender to delete their message
  await query(
    `DELETE FROM messages
     WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );
};
