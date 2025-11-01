-- Create chat_history table in Supabase
-- Run this in Supabase Dashboard → Database → SQL Editor

-- Create enum for sender type
CREATE TYPE sender_type AS ENUM ('user', 'ai');

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type sender_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);

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
DROP TRIGGER IF EXISTS update_chat_history_timestamp ON public.chat_history;
CREATE TRIGGER update_chat_history_timestamp
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_history_timestamp();
