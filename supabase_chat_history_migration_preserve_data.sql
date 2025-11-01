-- ============================================================
-- Migration: Update Existing chat_history Table
-- ============================================================
-- Run this to KEEP your existing data
-- This will modify the existing table structure
-- ============================================================

-- Step 1: Check if 'role' column exists, if not rename sender_type to role
DO $$ 
BEGIN
    -- If sender_type exists and role doesn't, we need to migrate
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_history' AND column_name = 'sender_type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_history' AND column_name = 'role'
    ) THEN
        -- Add role column
        ALTER TABLE public.chat_history ADD COLUMN role TEXT;
        
        -- Copy data from sender_type to role
        -- Map 'ai' to 'assistant', keep 'user' as 'user'
        UPDATE public.chat_history 
        SET role = CASE 
            WHEN sender_type::text = 'ai' THEN 'assistant'
            WHEN sender_type::text = 'user' THEN 'user'
            ELSE 'user'
        END;
        
        -- Make role NOT NULL after data migration
        ALTER TABLE public.chat_history ALTER COLUMN role SET NOT NULL;
        
        -- Add check constraint
        ALTER TABLE public.chat_history 
        ADD CONSTRAINT chat_history_role_check 
        CHECK (role IN ('user', 'assistant'));
        
        -- Drop old sender_type column
        ALTER TABLE public.chat_history DROP COLUMN sender_type;
        
        RAISE NOTICE 'Migrated sender_type to role column';
    ELSE
        RAISE NOTICE 'Column migration not needed or already done';
    END IF;
END $$;

-- Step 2: Drop sender_type enum if it exists
DROP TYPE IF EXISTS sender_type CASCADE;

-- Step 3: Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id 
ON public.chat_history(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_history_created_at 
ON public.chat_history(created_at DESC);

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Step 5: Recreate RLS policies (drop existing ones first)
DROP POLICY IF EXISTS "Users can view own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_history;
DROP POLICY IF EXISTS "Users can update own chat messages" ON public.chat_history;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_history;

CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
  ON public.chat_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON public.chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Ensure updated_at function and trigger exist
CREATE OR REPLACE FUNCTION public.update_chat_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chat_history_timestamp ON public.chat_history;
CREATE TRIGGER update_chat_history_timestamp
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_history_timestamp();

-- Step 7: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;

-- Verification
SELECT 'Migration complete! Verify with:' as status;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'chat_history';
