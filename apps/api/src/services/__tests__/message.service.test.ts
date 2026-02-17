/**
 * MessageService Tests
 *
 * CRITICAL: Tests for the message authorization security fix
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { MessageService } from '../message.service';
import { NotFoundError, ForbiddenError } from '../../errors';
import type { MatchModel, MessageModel } from '@letsmeet/shared';

// Mock database functions
const mockGetMatchById = mock();
const mockGetMatchMessages = mock();
const mockCreateMessage = mock();
const mockMarkMessagesRead = mock();
const mockUpdateLastMessageAt = mock();

// Mock the database module
mock.module('@letsmeet/database', () => ({
  getMatchById: mockGetMatchById,
  getMatchMessages: mockGetMatchMessages,
  createMessage: mockCreateMessage,
  markMatchMessagesAsRead: mockMarkMessagesRead,
  updateLastMessageAt: mockUpdateLastMessageAt,
}));

describe('MessageService', () => {
  let messageService: MessageService;

  const mockMatch: MatchModel = {
    id: 'match-123',
    user1Id: 'user-alice',
    user2Id: 'user-bob',
    matchedAt: new Date(),
    lastMessageAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage: MessageModel = {
    id: 'msg-1',
    matchId: 'match-123',
    senderId: 'user-alice',
    receiverId: 'user-bob',
    content: 'Hello!',
    sentAt: new Date(),
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    messageService = new MessageService();
    mockGetMatchById.mockReset();
    mockGetMatchMessages.mockReset();
    mockCreateMessage.mockReset();
    mockMarkMessagesRead.mockReset();
    mockUpdateLastMessageAt.mockReset();
  });

  describe('getMatchMessages - SECURITY TESTS', () => {
    it('should allow match participant to read messages', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockGetMatchMessages.mockResolvedValue([mockMessage]);

      const messages = await messageService.getMatchMessages(
        'match-123',
        'user-alice', // Alice is participant (user1)
        50,
        0
      );

      expect(messages).toEqual([mockMessage]);
      expect(mockGetMatchById).toHaveBeenCalledWith('match-123');
      expect(mockGetMatchMessages).toHaveBeenCalledWith('match-123', 50, 0);
    });

    it('should allow other participant to read messages', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockGetMatchMessages.mockResolvedValue([mockMessage]);

      const messages = await messageService.getMatchMessages(
        'match-123',
        'user-bob', // Bob is participant (user2)
        50,
        0
      );

      expect(messages).toEqual([mockMessage]);
    });

    it('should BLOCK non-participant from reading messages (SECURITY FIX)', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);

      await expect(
        messageService.getMatchMessages(
          'match-123',
          'user-charlie', // Charlie is NOT a participant
          50,
          0
        )
      ).rejects.toThrow(ForbiddenError);

      // Should NOT call getMatchMessages
      expect(mockGetMatchMessages).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if match does not exist', async () => {
      mockGetMatchById.mockResolvedValue(null);

      await expect(
        messageService.getMatchMessages('nonexistent-match', 'user-alice', 50, 0)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if match is inactive', async () => {
      const inactiveMatch = { ...mockMatch, isActive: false };
      mockGetMatchById.mockResolvedValue(inactiveMatch);

      await expect(
        messageService.getMatchMessages('match-123', 'user-alice', 50, 0)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('sendMessage - SECURITY TESTS', () => {
    it('should allow match participant to send message', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockCreateMessage.mockResolvedValue(mockMessage);
      mockUpdateLastMessageAt.mockResolvedValue(undefined);

      const message = await messageService.sendMessage(
        { matchId: 'match-123', content: 'Hello!' },
        'user-alice'
      );

      expect(message).toEqual(mockMessage);
      expect(mockCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: 'match-123',
          content: 'Hello!',
          senderId: 'user-alice',
          receiverId: 'user-bob', // Automatically determined
        })
      );
    });

    it('should correctly determine receiver (user1 sends to user2)', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockCreateMessage.mockResolvedValue(mockMessage);
      mockUpdateLastMessageAt.mockResolvedValue(undefined);

      await messageService.sendMessage(
        { matchId: 'match-123', content: 'Hi!' },
        'user-alice' // user1 sends
      );

      expect(mockCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: 'user-alice',
          receiverId: 'user-bob', // user2 receives
        })
      );
    });

    it('should correctly determine receiver (user2 sends to user1)', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockCreateMessage.mockResolvedValue(mockMessage);
      mockUpdateLastMessageAt.mockResolvedValue(undefined);

      await messageService.sendMessage(
        { matchId: 'match-123', content: 'Hi!' },
        'user-bob' // user2 sends
      );

      expect(mockCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: 'user-bob',
          receiverId: 'user-alice', // user1 receives
        })
      );
    });

    it('should BLOCK non-participant from sending messages (SECURITY FIX)', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);

      await expect(
        messageService.sendMessage(
          { matchId: 'match-123', content: 'Hacked!' },
          'user-charlie' // Not a participant
        )
      ).rejects.toThrow(ForbiddenError);

      expect(mockCreateMessage).not.toHaveBeenCalled();
    });

    it('should update match last message timestamp', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockCreateMessage.mockResolvedValue(mockMessage);
      mockUpdateLastMessageAt.mockResolvedValue(undefined);

      await messageService.sendMessage(
        { matchId: 'match-123', content: 'Test' },
        'user-alice'
      );

      expect(mockUpdateLastMessageAt).toHaveBeenCalledWith(
        'match-123',
        expect.any(Date)
      );
    });
  });

  describe('markMessagesRead - SECURITY TESTS', () => {
    it('should allow match participant to mark messages read', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);
      mockMarkMessagesRead.mockResolvedValue(undefined);

      await messageService.markMessagesRead('match-123', 'user-alice');

      expect(mockMarkMessagesRead).toHaveBeenCalledWith('match-123', 'user-alice');
    });

    it('should BLOCK non-participant from marking messages read (SECURITY FIX)', async () => {
      mockGetMatchById.mockResolvedValue(mockMatch);

      await expect(
        messageService.markMessagesRead('match-123', 'user-charlie')
      ).rejects.toThrow(ForbiddenError);

      expect(mockMarkMessagesRead).not.toHaveBeenCalled();
    });
  });
});
