-- Migration: Add conversation_id column to chat_history
-- Run this in Supabase Dashboard → Database → SQL Editor

-- Add conversation_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chat_history' 
        AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE public.chat_history 
        ADD COLUMN conversation_id UUID;
        
        -- Add index for the new column
        CREATE INDEX idx_chat_history_conversation_id 
        ON public.chat_history(conversation_id);
        
        RAISE NOTICE 'Added conversation_id column and index';
    ELSE
        RAISE NOTICE 'conversation_id column already exists';
    END IF;
END $$;
