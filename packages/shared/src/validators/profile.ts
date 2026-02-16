import { z } from 'zod';

/**
 * Profile Validation Schemas
 */

const genderSchema = z.enum(['male', 'female', 'non-binary', 'other']);
const relationshipGoalSchema = z.enum(['relationship', 'casual', 'friendship', 'unsure']);

export const createProfileSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50),
  age: z.number().int().min(18).max(100),
  gender: genderSchema,
  lookingFor: z.array(genderSchema).min(1),
  bio: z.string().max(500).optional(),

  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Photos
  photos: z.array(z.string().url()).min(1).max(6),

  // Interests
  interests: z.array(z.string()).max(10),

  // Preferences
  relationshipGoal: relationshipGoalSchema.optional(),
  maxDistance: z.number().int().min(1).max(500).optional(),
  ageRangeMin: z.number().int().min(18).max(100).optional(),
  ageRangeMax: z.number().int().min(18).max(100).optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  age: z.number().int().min(18).max(100).optional(),
  gender: genderSchema.optional(),
  lookingFor: z.array(genderSchema).min(1).optional(),
  bio: z.string().max(500).optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  photos: z.array(z.string().url()).min(1).max(6).optional(),
  interests: z.array(z.string()).max(10).optional(),

  relationshipGoal: relationshipGoalSchema.optional(),
  maxDistance: z.number().int().min(1).max(500).optional(),
  ageRangeMin: z.number().int().min(18).max(100).optional(),
  ageRangeMax: z.number().int().min(18).max(100).optional(),

  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
});

export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
