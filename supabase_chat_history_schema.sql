-- ============================================================
-- Supabase Chat History Schema with Realtime Support
-- ============================================================
-- Run this in Supabase Dashboard → Database → SQL Editor
--
-- This schema creates:
-- - chat_history table for storing messages
-- - RLS policies for user isolation
-- - Realtime replication for live updates
-- - Indexes for performance
-- - Conversation support for multiple chats
-- ============================================================

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  conversation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation_id ON public.chat_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);

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

-- ============================================================
-- Enable Realtime for Live Updates
-- ============================================================
-- This enables real-time subscriptions to chat_history changes
-- Clients can now listen to INSERT, UPDATE, DELETE events

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;

-- ============================================================
-- Verify Configuration
-- ============================================================
-- Run these queries to verify everything is set up correctly:
--
-- 1. Check if table is replicated:
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';
--
-- 2. Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'chat_history';
--
-- 3. Test insert (replace with your user_id):
-- INSERT INTO chat_history (user_id, message, role)
-- VALUES ('your-user-id-here', 'Test message', 'user');
-- ============================================================

-- ============================================================
-- Optional: Conversations Table
-- ============================================================
-- Uncomment to add support for multiple conversations:
--
-- CREATE TABLE IF NOT EXISTS public.conversations (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   title TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
--
-- ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view own conversations"
--   ON public.conversations FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can create own conversations"
--   ON public.conversations FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can update own conversations"
--   ON public.conversations FOR UPDATE
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own conversations"
--   ON public.conversations FOR DELETE
--   USING (auth.uid() = user_id);
-- ============================================================
