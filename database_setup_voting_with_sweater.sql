-- Drop the old votes table if it exists
DROP TABLE IF EXISTS votes CASCADE;

-- Create votes table with ugly_sweater category
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_user_id UUID NOT NULL,
  voted_for_user_id UUID NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('princess', 'prince', 'ugly_sweater')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_user_id, category)
);

-- Create indexes for performance
CREATE INDEX idx_votes_voter_user_id ON votes(voter_user_id);
CREATE INDEX idx_votes_voted_for_user_id ON votes(voted_for_user_id);
CREATE INDEX idx_votes_category ON votes(category);

-- Disable RLS for custom auth
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
