-- ============================================================
-- Supabase Chat History Schema - Clean Setup
-- ============================================================
-- Run this in Supabase Dashboard → Database → SQL Editor
--
-- This will:
-- 1. Drop the existing table (WARNING: deletes all chat history)
-- 2. Create a fresh table with proper structure
-- 3. Enable Row Level Security
-- 4. Enable Realtime
-- ============================================================

-- DROP EXISTING TABLE (WARNING: This deletes all data!)
-- Comment out these lines if you want to keep existing data
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP TYPE IF EXISTS sender_type CASCADE;

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own chat history
CREATE POLICY "Users can view own chat history"
  ON public.chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat messages
CREATE POLICY "Users can update own chat messages"
  ON public.chat_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages"
  ON public.chat_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_chat_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_chat_history_timestamp
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_history_timestamp();

-- ============================================================
-- Enable Realtime for Live Updates
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;

-- ============================================================
-- Verification
-- ============================================================
-- Run this to verify everything is set up:
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';

-- Test insert (replace with your actual user_id):
-- INSERT INTO chat_history (user_id, message, role)
-- VALUES ('your-user-id-here', 'Test message', 'user');
