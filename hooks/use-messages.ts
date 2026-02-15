/**
 * useMessages Hook
 *
 * Manages chat messages with polling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import {
  getMatchMessages,
  createMessage,
  markMatchMessagesAsRead,
} from '../api/database/queries/messages';
import type { MessageWithSender, CreateMessageInput } from '../api/database/models/message';

/**
 * Fetch messages for a specific match with polling
 */
export function useMessages(matchId: string, enabled: boolean = true) {
  const { userId } = useAuth();

  return useQuery<MessageWithSender[]>({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const messages = await getMatchMessages(matchId, 100);
      // Reverse to show oldest first
      return messages.reverse();
    },
    enabled: enabled && !!matchId,
    staleTime: 0, // Always consider stale
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 3000, // Poll every 3 seconds when screen is active
  });
}

/**
 * Send a message mutation
 */
export function useSendMessage(matchId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateMessageInput, 'senderId' | 'matchId'>) => {
      if (!userId) throw new Error('User not authenticated');

      return await createMessage({
        ...input,
        matchId,
        senderId: userId,
      });
    },
    onSuccess: () => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      // Update match's last message timestamp
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

/**
 * Mark messages as read mutation
 */
export function useMarkAsRead(matchId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      await markMatchMessagesAsRead(matchId, userId);
    },
    onSuccess: () => {
      // Update matches list to clear unread count
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
