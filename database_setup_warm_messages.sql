-- Warm Messages Feature Database Setup
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS warm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) <= 150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_warm_messages_from_user ON warm_messages(from_user_id);
CREATE INDEX idx_warm_messages_to_user ON warm_messages(to_user_id);
CREATE INDEX idx_warm_messages_created_at ON warm_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE warm_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read messages
CREATE POLICY "Anyone can read messages" ON warm_messages
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can send messages" ON warm_messages
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
