/**
 * Profile Model
 *
 * Dating profile with photos, bio, and preferences
 */

export interface ProfileModel {
  id: string;
  userId: string; // Clerk user ID
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  lookingFor: ('male' | 'female' | 'non-binary' | 'other')[];
  bio?: string;

  // Location
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  // Photos (Cloudinary URLs)
  photos: string[];

  // Interests/tags
  interests: string[];

  // Preferences
  relationshipGoal?: 'relationship' | 'casual' | 'friendship' | 'unsure';
  maxDistance?: number; // in kilometers
  ageRangeMin?: number;
  ageRangeMax?: number;

  // Status
  isActive: boolean;
  lastActive: Date;
  isPremium: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProfileInput = Omit<ProfileModel, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'lastActive' | 'isPremium'>;
export type UpdateProfileInput = Partial<Omit<ProfileModel, 'id' | 'userId' | 'createdAt'>>;
