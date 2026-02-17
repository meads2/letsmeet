/**
 * Message Service
 *
 * CRITICAL: Handles messaging with authorization checks
 * This service fixes the security vulnerability where users could
 * read messages from matches they're not part of
 */

import {
  getMatchMessages as dbGetMatchMessages,
  createMessage as dbCreateMessage,
  markMatchMessagesAsRead as dbMarkMessagesRead,
  updateLastMessageAt,
  getMatchById,
} from '@letsmeet/database';
import type { MessageModel, CreateMessageInput } from '@letsmeet/shared';
import { NotFoundError, ForbiddenError } from '../errors';

export class MessageService {
  /**
   * Verify user is a participant in a match
   * CRITICAL: This prevents unauthorized access to messages
   */
  private async verifyMatchParticipation(matchId: string, userId: string): Promise<void> {
    const match = await getMatchById(matchId);

    if (!match) {
      throw new NotFoundError('Match');
    }

    if (!match.isActive) {
      throw new ForbiddenError('This match is no longer active');
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenError('You are not a participant in this match');
    }
  }

  /**
   * Get messages for a match (with authorization check)
   */
  async getMatchMessages(
    matchId: string,
    requestingUserId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageModel[]> {
    // CRITICAL: Verify user is in this match
    await this.verifyMatchParticipation(matchId, requestingUserId);

    return await dbGetMatchMessages(matchId, limit, offset);
  }

  /**
   * Send a message (with authorization check)
   */
  async sendMessage(input: CreateMessageInput, senderId: string): Promise<MessageModel> {
    // CRITICAL: Verify sender is in this match
    await this.verifyMatchParticipation(input.matchId, senderId);

    // Get match to determine receiver
    const match = await getMatchById(input.matchId);
    if (!match) {
      throw new NotFoundError('Match');
    }

    // Determine receiver (the other person in the match)
    const receiverId = match.user1Id === senderId ? match.user2Id : match.user1Id;

    // Create the message
    const message = await dbCreateMessage({
      ...input,
      senderId,
      receiverId,
      sentAt: new Date(),
    });

    // Update match's last message timestamp
    await updateLastMessageAt(input.matchId, message.sentAt);

    return message;
  }

  /**
   * Mark messages as read (with authorization check)
   */
  async markMessagesRead(matchId: string, userId: string): Promise<void> {
    // CRITICAL: Verify user is in this match
    await this.verifyMatchParticipation(matchId, userId);

    await dbMarkMessagesRead(matchId, userId);
  }
}
