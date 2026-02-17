/**
 * Profile Queries (Drizzle ORM)
 *
 * Type-safe CRUD operations for user dating profiles using Drizzle
 * This is an example of migrating from raw SQL to Drizzle ORM
 */

import { db, schema } from '../drizzle';
import { eq } from 'drizzle-orm';
import type { ProfileModel, CreateProfileInput, UpdateProfileInput } from '@letsmeet/shared';

/**
 * Get profile by user ID
 */
export const getProfileByUserIdDrizzle = async (userId: string): Promise<ProfileModel | null> => {
  const profile = await db.query.profiles.findFirst({
    where: eq(schema.profiles.userId, userId),
  });

  return profile as ProfileModel | null;
};

/**
 * Get profile by ID
 */
export const getProfileByIdDrizzle = async (id: string): Promise<ProfileModel | null> => {
  const profile = await db.query.profiles.findFirst({
    where: eq(schema.profiles.id, id),
  });

  return profile as ProfileModel | null;
};

/**
 * Create a new profile
 */
export const createProfileDrizzle = async (input: CreateProfileInput): Promise<ProfileModel> => {
  const [profile] = await db
    .insert(schema.profiles)
    .values({
      userId: input.userId,
      displayName: input.displayName,
      age: input.age,
      gender: input.gender,
      lookingFor: input.lookingFor,
      bio: input.bio,
      city: input.city,
      state: input.state,
      country: input.country,
      latitude: input.latitude,
      longitude: input.longitude,
      photos: input.photos,
      interests: input.interests,
      relationshipGoal: input.relationshipGoal,
      maxDistance: input.maxDistance,
      ageRangeMin: input.ageRangeMin,
      ageRangeMax: input.ageRangeMax,
      isActive: true,
      lastActive: new Date(),
      isPremium: false,
    })
    .returning();

  return profile as ProfileModel;
};

/**
 * Update profile
 */
export const updateProfileDrizzle = async (
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileModel | null> => {
  const [updated] = await db
    .update(schema.profiles)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(schema.profiles.userId, userId))
    .returning();

  return (updated as ProfileModel) || null;
};

/**
 * Delete profile
 */
export const deleteProfileDrizzle = async (userId: string): Promise<void> => {
  await db.delete(schema.profiles).where(eq(schema.profiles.userId, userId));
};

/**
 * Update premium status
 */
export const updatePremiumStatusDrizzle = async (
  userId: string,
  isPremium: boolean
): Promise<void> => {
  await db
    .update(schema.profiles)
    .set({
      isPremium,
      updatedAt: new Date(),
    })
    .where(eq(schema.profiles.userId, userId));
};
