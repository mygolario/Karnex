-- API Usage Tracking Table
-- Tracks monthly AI request counts per user
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: '2026-02'
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_usage_user_month ON api_usage(user_id, month);

-- Enable RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own usage
CREATE POLICY "Users can read own usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own usage
CREATE POLICY "Users can insert own usage" ON api_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own usage
CREATE POLICY "Users can update own usage" ON api_usage
  FOR UPDATE USING (auth.uid() = user_id);
