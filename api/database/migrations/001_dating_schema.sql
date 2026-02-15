-- Dating App Database Schema Migration
-- This migration transforms the meeting scheduling schema into a dating app schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old meeting tables
DROP TABLE IF EXISTS meeting_attendees CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL UNIQUE, -- Clerk user ID
  display_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  looking_for VARCHAR(50)[] NOT NULL, -- Array of genders
  bio TEXT,

  -- Location
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Photos (Cloudinary URLs)
  photos TEXT[] NOT NULL DEFAULT '{}',

  -- Interests/tags
  interests VARCHAR(100)[] NOT NULL DEFAULT '{}',

  -- Preferences
  relationship_goal VARCHAR(50) CHECK (relationship_goal IN ('relationship', 'casual', 'friendship', 'unsure')),
  max_distance INTEGER DEFAULT 50, -- in kilometers
  age_range_min INTEGER DEFAULT 18,
  age_range_max INTEGER DEFAULT 99,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_active TIMESTAMP NOT NULL DEFAULT NOW(),
  is_premium BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL, -- User who swiped
  target_user_id VARCHAR(255) NOT NULL, -- User being swiped on
  action VARCHAR(50) NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Prevent duplicate swipes
  UNIQUE(user_id, target_user_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id VARCHAR(255) NOT NULL,
  user2_id VARCHAR(255) NOT NULL,
  matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Ensure user1_id < user2_id for consistency
  CHECK (user1_id < user2_id),
  -- Prevent duplicate matches
  UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  receiver_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'image', 'gif')),
  media_url TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_active ON profiles(is_active, last_active);
CREATE INDEX idx_profiles_gender_looking ON profiles(gender, looking_for);
CREATE INDEX idx_profiles_location ON profiles USING GIST(
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_premium ON profiles(is_premium);

-- Swipe indexes
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_target_user_id ON swipes(target_user_id);
CREATE INDEX idx_swipes_user_target ON swipes(user_id, target_user_id);
CREATE INDEX idx_swipes_created_at ON swipes(created_at);

-- Match indexes
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_matches_active ON matches(is_active);
CREATE INDEX idx_matches_last_message ON matches(last_message_at DESC NULLS LAST);

-- Message indexes
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(match_id, created_at DESC);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, read_at) WHERE read_at IS NULL;

-- Note: For the geospatial index to work, you may need to install the earthdistance extension:
-- CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
-- If earthdistance is not available, comment out the GIST index and use the Haversine formula in queries

-- Update triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - comment out for production)
-- INSERT INTO profiles (user_id, display_name, age, gender, looking_for, bio, photos, interests)
-- VALUES
--   ('user_1', 'Alex', 28, 'female', ARRAY['male'], 'Love hiking and coffee', ARRAY['https://example.com/photo1.jpg'], ARRAY['hiking', 'coffee', 'travel']),
--   ('user_2', 'Jordan', 26, 'male', ARRAY['female'], 'Software engineer', ARRAY['https://example.com/photo2.jpg'], ARRAY['coding', 'gaming', 'travel']);

COMMENT ON TABLE profiles IS 'User dating profiles with photos and preferences';
COMMENT ON TABLE swipes IS 'Tracks all swipe actions (like/pass/super_like)';
COMMENT ON TABLE matches IS 'Mutual likes between users';
COMMENT ON TABLE messages IS 'Chat messages between matched users';
