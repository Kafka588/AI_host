-- Database Schema for Princess & Prince Voting System (Updated)
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop old nominees table if exists
DROP TABLE IF EXISTS nominees CASCADE;

-- 2. Create/Update votes table to vote for users directly
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_user_id UUID NOT NULL,
  voted_for_user_id UUID NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('princess', 'prince')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_user_id, category) -- One vote per voter per category
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_voter_user_id ON votes(voter_user_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_for_user_id ON votes(voted_for_user_id);
CREATE INDEX IF NOT EXISTS idx_votes_category ON votes(category);

-- 4. Row Level Security (RLS) Policies
-- Disable RLS (easier for custom auth)
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

-- Note: Users table should have a 'sex' column (male/female)
-- The voting automatically assigns:
-- - Princess: votes for users with sex = 'female'
-- - Prince: votes for users with sex = 'male'
