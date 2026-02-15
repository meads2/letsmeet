/**
 * Profile Queries
 *
 * CRUD operations for user dating profiles
 */

import { query, queryOne } from '../client';
import type { ProfileModel, CreateProfileInput, UpdateProfileInput } from '../models/profile';

/**
 * Get profile by user ID
 */
export const getProfileByUserId = async (userId: string): Promise<ProfileModel | null> => {
  return await queryOne<ProfileModel>(
    `SELECT * FROM profiles WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id: string): Promise<ProfileModel | null> => {
  return await queryOne<ProfileModel>(
    `SELECT * FROM profiles WHERE id = $1`,
    [id]
  );
};

/**
 * Create a new profile
 */
export const createProfile = async (input: CreateProfileInput): Promise<ProfileModel> => {
  const result = await queryOne<ProfileModel>(
    `INSERT INTO profiles (
      user_id, display_name, age, gender, looking_for, bio,
      city, state, country, latitude, longitude,
      photos, interests,
      relationship_goal, max_distance, age_range_min, age_range_max,
      is_active, last_active, is_premium
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13,
      $14, $15, $16, $17,
      true, NOW(), false
    ) RETURNING *`,
    [
      input.userId,
      input.displayName,
      input.age,
      input.gender,
      input.lookingFor,
      input.bio,
      input.city,
      input.state,
      input.country,
      input.latitude,
      input.longitude,
      input.photos,
      input.interests,
      input.relationshipGoal,
      input.maxDistance || 50, // Default 50km
      input.ageRangeMin || 18,
      input.ageRangeMax || 99,
    ]
  );

  if (!result) {
    throw new Error('Failed to create profile');
  }

  return result;
};

/**
 * Update profile
 */
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileModel> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build dynamic UPDATE query
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updates.push(`${snakeKey} = $${paramIndex++}`);
      values.push(value);
    }
  });

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  // Always update updated_at and last_active
  updates.push(`updated_at = NOW()`);
  updates.push(`last_active = NOW()`);

  const result = await queryOne<ProfileModel>(
    `UPDATE profiles
     SET ${updates.join(', ')}
     WHERE user_id = $${paramIndex}
     RETURNING *`,
    [...values, userId]
  );

  if (!result) {
    throw new Error('Profile not found');
  }

  return result;
};

/**
 * Delete profile
 */
export const deleteProfile = async (userId: string): Promise<void> => {
  await query(
    `DELETE FROM profiles WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Update last active timestamp
 */
export const updateLastActive = async (userId: string): Promise<void> => {
  await query(
    `UPDATE profiles SET last_active = NOW() WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Update premium status
 */
export const updatePremiumStatus = async (userId: string, isPremium: boolean): Promise<void> => {
  await query(
    `UPDATE profiles SET is_premium = $1, updated_at = NOW() WHERE user_id = $2`,
    [isPremium, userId]
  );
};
