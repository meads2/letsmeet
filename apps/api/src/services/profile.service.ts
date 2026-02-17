/**
 * Profile Service
 *
 * Business logic for profile management
 */

import {
  getProfileByUserId,
  createProfile as dbCreateProfile,
  updateProfile as dbUpdateProfile,
  deleteProfile as dbDeleteProfile,
} from '@letsmeet/database';
import type { ProfileModel, CreateProfileInput, UpdateProfileInput } from '@letsmeet/shared';
import { NotFoundError } from '../errors';

export class ProfileService {
  /**
   * Get profile by user ID or throw NotFoundError
   * Centralizes profile existence validation
   */
  async getProfileOrThrow(userId: string): Promise<ProfileModel> {
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    return profile;
  }

  /**
   * Check if user has premium subscription
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    const profile = await this.getProfileOrThrow(userId);
    return profile.isPremium || false;
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(userId: string, input: CreateProfileInput): Promise<ProfileModel> {
    // Check if profile already exists
    const existing = await getProfileByUserId(userId);
    if (existing) {
      throw new Error('Profile already exists');
    }

    const profile = await dbCreateProfile({
      ...input,
      userId,
    });

    return profile;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, input: UpdateProfileInput): Promise<ProfileModel> {
    // Ensure profile exists
    await this.getProfileOrThrow(userId);

    const updated = await dbUpdateProfile(userId, input);

    if (!updated) {
      throw new NotFoundError('Profile');
    }

    return updated;
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId: string): Promise<void> {
    // Ensure profile exists
    await this.getProfileOrThrow(userId);

    await dbDeleteProfile(userId);
  }
}
