/**
 * User Model
 */

export interface UserModel {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  subscriptionStatus?: 'free' | 'premium' | 'premium_plus';
  subscriptionId?: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<UserModel, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<UserModel, 'id' | 'clerkId' | 'createdAt'>>;
