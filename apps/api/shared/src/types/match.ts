/**
 * Match Model
 *
 * Created when two users mutually like each other
 */

export interface MatchModel {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
  lastMessageAt?: Date;
  isActive: boolean; // False if unmatched
  createdAt: Date;
  updatedAt: Date;
}

export type CreateMatchInput = Omit<MatchModel, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'isActive'>;
export type UpdateMatchInput = Partial<Omit<MatchModel, 'id' | 'user1Id' | 'user2Id' | 'createdAt' | 'matchedAt'>>;

/**
 * Match with user details (for UI display)
 */
export interface MatchWithProfile extends MatchModel {
  otherUser: {
    id: string;
    displayName: string;
    age: number;
    photos: string[];
    bio?: string;
  };
  unreadCount?: number;
}
