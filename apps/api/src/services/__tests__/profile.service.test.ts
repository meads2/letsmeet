/**
 * ProfileService Tests
 *
 * Tests for profile management and premium status checks
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ProfileService } from '../profile.service';
import { NotFoundError } from '../../errors';
import type { ProfileModel, CreateProfileInput, UpdateProfileInput } from '@letsmeet/shared';

// Mock database functions
const mockGetProfileByUserId = mock();
const mockCreateProfile = mock();
const mockUpdateProfile = mock();
const mockDeleteProfile = mock();

// Mock the database module
mock.module('@letsmeet/database', () => ({
  getProfileByUserId: mockGetProfileByUserId,
  createProfile: mockCreateProfile,
  updateProfile: mockUpdateProfile,
  deleteProfile: mockDeleteProfile,
}));

describe('ProfileService', () => {
  let profileService: ProfileService;

  const mockProfile: ProfileModel = {
    id: 'profile-123',
    userId: 'user-123',
    displayName: 'Alice',
    age: 25,
    bio: 'Test bio',
    photos: ['photo1.jpg'],
    location: { latitude: 37.7749, longitude: -122.4194 },
    preferences: {
      minAge: 21,
      maxAge: 35,
      maxDistance: 50,
      genderPreference: ['male'],
    },
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    profileService = new ProfileService();
    mockGetProfileByUserId.mockReset();
    mockCreateProfile.mockReset();
    mockUpdateProfile.mockReset();
    mockDeleteProfile.mockReset();
  });

  describe('getProfileOrThrow', () => {
    it('should return profile when it exists', async () => {
      mockGetProfileByUserId.mockResolvedValue(mockProfile);

      const profile = await profileService.getProfileOrThrow('user-123');

      expect(profile).toEqual(mockProfile);
      expect(mockGetProfileByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      await expect(
        profileService.getProfileOrThrow('user-nonexistent')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error with correct message', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      try {
        await profileService.getProfileOrThrow('user-123');
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('Profile');
        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe('isPremiumUser', () => {
    it('should return true for premium user', async () => {
      const premiumProfile = { ...mockProfile, isPremium: true };
      mockGetProfileByUserId.mockResolvedValue(premiumProfile);

      const isPremium = await profileService.isPremiumUser('user-123');

      expect(isPremium).toBe(true);
    });

    it('should return false for free user', async () => {
      mockGetProfileByUserId.mockResolvedValue(mockProfile);

      const isPremium = await profileService.isPremiumUser('user-123');

      expect(isPremium).toBe(false);
    });

    it('should throw NotFoundError if profile does not exist', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      await expect(
        profileService.isPremiumUser('user-nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUserProfile', () => {
    const createInput: CreateProfileInput = {
      userId: 'user-123',
      displayName: 'Bob',
      dateOfBirth: '1998-01-01',
      gender: 'male',
      bio: 'New user',
      photos: ['photo.jpg'],
      location: { latitude: 37.7749, longitude: -122.4194 },
      preferences: {
        minAge: 21,
        maxAge: 30,
        maxDistance: 25,
        genderPreference: ['female'],
      },
    };

    it('should create new profile successfully', async () => {
      mockGetProfileByUserId.mockResolvedValue(null); // No existing profile
      mockCreateProfile.mockResolvedValue(mockProfile);

      const profile = await profileService.createUserProfile('user-123', createInput);

      expect(profile).toEqual(mockProfile);
      expect(mockCreateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          displayName: 'Bob',
        })
      );
    });

    it('should throw error if profile already exists', async () => {
      mockGetProfileByUserId.mockResolvedValue(mockProfile); // Profile exists

      await expect(
        profileService.createUserProfile('user-123', createInput)
      ).rejects.toThrow('Profile already exists');

      expect(mockCreateProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    const updateInput: UpdateProfileInput = {
      bio: 'Updated bio',
      photos: ['new-photo.jpg'],
    };

    it('should update profile successfully', async () => {
      const updatedProfile = { ...mockProfile, bio: 'Updated bio' };
      mockGetProfileByUserId.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(updatedProfile);

      const profile = await profileService.updateUserProfile('user-123', updateInput);

      expect(profile).toEqual(updatedProfile);
      expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', updateInput);
    });

    it('should verify profile exists before updating', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      await expect(
        profileService.updateUserProfile('user-nonexistent', updateInput)
      ).rejects.toThrow(NotFoundError);

      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if update fails', async () => {
      mockGetProfileByUserId.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(null); // Update failed

      await expect(
        profileService.updateUserProfile('user-123', updateInput)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete profile successfully', async () => {
      mockGetProfileByUserId.mockResolvedValue(mockProfile);
      mockDeleteProfile.mockResolvedValue(undefined);

      await profileService.deleteUserProfile('user-123');

      expect(mockDeleteProfile).toHaveBeenCalledWith('user-123');
    });

    it('should verify profile exists before deleting', async () => {
      mockGetProfileByUserId.mockResolvedValue(null);

      await expect(
        profileService.deleteUserProfile('user-nonexistent')
      ).rejects.toThrow(NotFoundError);

      expect(mockDeleteProfile).not.toHaveBeenCalled();
    });
  });
});
