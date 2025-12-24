-- Database Schema for Princess & Prince Voting System
-- Run this SQL in your Supabase SQL Editor

-- 1. Create nominees table
CREATE TABLE IF NOT EXISTS nominees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('princess', 'prince')),
  user_id UUID NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('princess', 'prince')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category) -- One vote per user per category
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nominees_category ON nominees(category);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_nominee_id ON votes(nominee_id);
CREATE INDEX IF NOT EXISTS idx_votes_category ON votes(category);

-- 4. Row Level Security (RLS) Policies
-- You can either disable RLS or set up permissive policies based on your custom auth

-- Option A: Disable RLS (easier for custom auth)
ALTER TABLE nominees DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

-- Option B: Enable RLS with permissive policies (if you prefer)
-- Uncomment below if you want to use RLS

/*
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow all operations on nominees
CREATE POLICY "Allow all on nominees" ON nominees
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on votes
CREATE POLICY "Allow all on votes" ON votes
  FOR ALL USING (true) WITH CHECK (true);
*/

-- 5. Sample data (optional - for testing)
/*
-- Insert sample nominees (replace user_id with actual user IDs from your users table)
INSERT INTO nominees (name, category, user_id) VALUES
  ('Alice', 'princess', 'replace-with-actual-user-id'),
  ('Bob', 'prince', 'replace-with-actual-user-id');
*/
