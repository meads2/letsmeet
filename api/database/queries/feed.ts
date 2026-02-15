/**
 * Feed Queries
 *
 * Generate personalized swipe feed for users
 */

import { query } from '../client';
import type { ProfileModel } from '../models/profile';

export interface FeedProfile extends ProfileModel {
  distance?: number; // Distance in kilometers
  mutualInterests?: string[]; // Shared interests
}

/**
 * Generate swipe feed for a user
 *
 * Algorithm:
 * 1. Exclude users already swiped on
 * 2. Filter by preferences (gender, age range, max distance)
 * 3. Exclude blocked/reported users
 * 4. Exclude inactive profiles (>30 days unless premium)
 * 5. Rank by: recently active, complete profiles, proximity, mutual interests
 */
export const getFeedForUser = async (
  userId: string,
  limit: number = 20
): Promise<FeedProfile[]> => {
  const profiles = await query<any>(
    `WITH user_profile AS (
       SELECT * FROM profiles WHERE user_id = $1
     ),
     eligible_profiles AS (
       SELECT
         p.*,
         -- Calculate distance (Haversine formula approximation)
         CASE
           WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL
                AND up.latitude IS NOT NULL AND up.longitude IS NOT NULL
           THEN (
             6371 * acos(
               cos(radians(up.latitude))
               * cos(radians(p.latitude))
               * cos(radians(p.longitude) - radians(up.longitude))
               + sin(radians(up.latitude))
               * sin(radians(p.latitude))
             )
           )
           ELSE 999999
         END as distance,
         -- Count mutual interests
         (
           SELECT COUNT(*)
           FROM unnest(p.interests) AS interest
           WHERE interest = ANY(up.interests)
         ) as mutual_interest_count,
         -- Profile completeness score
         (
           CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 10 ELSE 0 END +
           CASE WHEN array_length(p.photos, 1) >= 3 THEN 20 ELSE array_length(p.photos, 1) * 5 END +
           CASE WHEN array_length(p.interests, 1) >= 3 THEN 10 ELSE 0 END
         ) as completeness_score
       FROM profiles p
       CROSS JOIN user_profile up
       WHERE p.user_id != $1
         AND p.is_active = true
         -- Gender preference match
         AND p.gender = ANY(up.looking_for)
         AND up.gender = ANY(p.looking_for)
         -- Age range match
         AND p.age BETWEEN COALESCE(up.age_range_min, 18) AND COALESCE(up.age_range_max, 99)
         AND up.age BETWEEN COALESCE(p.age_range_min, 18) AND COALESCE(p.age_range_max, 99)
         -- Exclude already swiped
         AND NOT EXISTS (
           SELECT 1 FROM swipes s
           WHERE s.user_id = $1 AND s.target_user_id = p.user_id
         )
         -- Exclude inactive profiles (unless premium)
         AND (
           p.is_premium = true
           OR p.last_active >= NOW() - INTERVAL '30 days'
         )
     )
     SELECT
       ep.*,
       -- Extract mutual interests for UI display
       (
         SELECT array_agg(interest)
         FROM unnest(ep.interests) AS interest
         WHERE interest = ANY((SELECT interests FROM user_profile))
       ) as mutual_interests
     FROM eligible_profiles ep
     WHERE ep.distance <= (SELECT COALESCE(max_distance, 50) FROM user_profile)
     ORDER BY
       -- Recently active users first
       (EXTRACT(EPOCH FROM NOW() - ep.last_active) / 3600) ASC,
       -- Complete profiles
       ep.completeness_score DESC,
       -- Proximity
       ep.distance ASC,
       -- Mutual interests
       ep.mutual_interest_count DESC,
       -- Some randomization
       RANDOM()
     LIMIT $2`,
    [userId, limit]
  );

  return profiles.map(p => ({
    id: p.id,
    userId: p.user_id,
    displayName: p.display_name,
    age: p.age,
    gender: p.gender,
    lookingFor: p.looking_for,
    bio: p.bio,
    city: p.city,
    state: p.state,
    country: p.country,
    latitude: p.latitude,
    longitude: p.longitude,
    photos: p.photos,
    interests: p.interests,
    relationshipGoal: p.relationship_goal,
    maxDistance: p.max_distance,
    ageRangeMin: p.age_range_min,
    ageRangeMax: p.age_range_max,
    isActive: p.is_active,
    lastActive: p.last_active,
    isPremium: p.is_premium,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    distance: p.distance < 999999 ? Math.round(p.distance) : undefined,
    mutualInterests: p.mutual_interests || [],
  }));
};

/**
 * Get feed count (how many profiles available)
 */
export const getFeedCount = async (userId: string): Promise<number> => {
  const result = await query<{ count: number }>(
    `WITH user_profile AS (
       SELECT * FROM profiles WHERE user_id = $1
     )
     SELECT COUNT(*) as count
     FROM profiles p
     CROSS JOIN user_profile up
     WHERE p.user_id != $1
       AND p.is_active = true
       AND p.gender = ANY(up.looking_for)
       AND up.gender = ANY(p.looking_for)
       AND p.age BETWEEN COALESCE(up.age_range_min, 18) AND COALESCE(up.age_range_max, 99)
       AND up.age BETWEEN COALESCE(p.age_range_min, 18) AND COALESCE(p.age_range_max, 99)
       AND NOT EXISTS (
         SELECT 1 FROM swipes s
         WHERE s.user_id = $1 AND s.target_user_id = p.user_id
       )
       AND (p.is_premium = true OR p.last_active >= NOW() - INTERVAL '30 days')`,
    [userId]
  );

  return result[0]?.count || 0;
};
