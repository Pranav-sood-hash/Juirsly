# Upgrade Chat Storage from localStorage to Supabase

Your app currently stores chats in **localStorage**. This guide shows how to upgrade to **Supabase** for persistent, cross-device chat history.

---

## Benefits of Supabase Storage

✅ **Persistent** - Data saved to cloud, not lost when clearing browser
✅ **Cross-device** - Access chats from any device
✅ **Scalable** - No localStorage size limits
✅ **Secure** - Row Level Security ensures users only see their own chats
✅ **Real-time** - Optional real-time sync across devices

---

## Step 1: Run the SQL Schema

1. Go to **Supabase Dashboard** → **Database** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase_chat_history_schema.sql`
4. Click **Run**

This creates:
- `chat_history` table
- `sender_type` enum
- Row Level Security policies
- Indexes for faster queries

---

## Step 2: Create the Service Layer

Create `src/services/chatService.ts`:

```typescript
import { supabase } from '../lib/supabase';

export type SenderType = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender_type: SenderType;
  created_at: string;
}

// Save a new message
export async function saveMessage(message: string, senderType: SenderType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: user.id,
      message,
      sender_type: senderType,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all messages for current user
export async function getAllMessages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Delete all chat history
export async function clearAllMessages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
```

---

## Step 3: Modify ChatContext (Option A - Simple Migration)

Update `src/contexts/ChatContext.tsx` to add Supabase support alongside localStorage:

```typescript
import { useEffect } from 'react';
import { getAllMessages, saveMessage, clearAllMessages } from '../services/chatService';

// Add this inside ChatProvider, after the existing localStorage useEffect:

// Load from Supabase instead of localStorage
useEffect(() => {
  if (user?.email) {
    loadMessagesFromSupabase();
  }
}, [user]);

async function loadMessagesFromSupabase() {
  try {
    const messages = await getAllMessages();
    
    // Convert Supabase format to your Conversation format
    const conversation: Conversation = {
      id: 'supabase-chat',
      userId: user?.email || '',
      title: 'Chat History',
      messages: messages.map(msg => ({
        id: msg.id,
        sender: msg.sender_type,
        text: msg.message,
        timestamp: msg.created_at,
      })),
      createdAt: messages[0]?.created_at || new Date().toISOString(),
      updatedAt: messages[messages.length - 1]?.created_at || new Date().toISOString(),
    };
    
    setConversations([conversation]);
    setCurrentConversationId(conversation.id);
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    // Fallback to localStorage if Supabase fails
  }
}

// Modify addMessage to save to Supabase
const addMessage = async (message: ChatMessage) => {
  try {
    // Save to Supabase
    await saveMessage(message.text, message.sender);
    
    // Update local state
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      });
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
};

// Modify clearAllChats to use Supabase
const clearAllChats = async () => {
  try {
    await clearAllMessages();
    setConversations([]);
    createInitialChat();
  } catch (error) {
    console.error('Error clearing chats:', error);
  }
};
```

---

## Step 4: Migration Strategy

### Option 1: Migrate Existing Data

Add this migration function to transfer localStorage data to Supabase:

```typescript
async function migrateLocalStorageToSupabase() {
  if (!user?.email) return;

  const storageKey = `jurisly_chats_${user.email}`;
  const savedChats = localStorage.getItem(storageKey);
  
  if (!savedChats) return;

  try {
    const conversations = JSON.parse(savedChats) as Conversation[];
    
    // Upload all messages to Supabase
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        await saveMessage(msg.text, msg.sender);
      }
    }
    
    // Clear localStorage after successful migration
    localStorage.removeItem(storageKey);
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Call this once on first load
useEffect(() => {
  if (user?.email) {
    migrateLocalStorageToSupabase();
  }
}, [user]);
```

### Option 2: Fresh Start

Simply remove localStorage code and start fresh with Supabase. Old chats will remain in localStorage but won't be used.

---

## Step 5: Test the Integration

1. **Run the SQL schema** in Supabase
2. **Update ChatContext** with Supabase integration
3. **Restart the app**
4. **Send a test message**
5. **Check Supabase Dashboard** → Database → Table Editor → `chat_history`
6. **Verify messages appear** in the table

---

## Comparison: Before vs After

### Before (localStorage)
```typescript
// Save message
const storageKey = `jurisly_chats_${user.email}`;
localStorage.setItem(storageKey, JSON.stringify(conversations));
```

### After (Supabase)
```typescript
// Save message
await saveMessage(message.text, 'user');
```

---

## Bonus: Real-Time Sync

Add real-time updates so chats sync across devices instantly:

```typescript
useEffect(() => {
  if (!user?.email) return;

  const channel = supabase
    .channel('chat_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_history',
      },
      (payload) => {
        // Add new message to state when it arrives
        const newMsg = payload.new as ChatMessage;
        // Update your conversations state here
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
```

---

## Next Steps

1. ✅ Run SQL schema in Supabase
2. ✅ Create `chatService.ts`
3. ✅ Update `ChatContext.tsx`
4. ✅ Test message saving
5. ✅ (Optional) Migrate old data
6. ✅ (Optional) Add real-time sync

Your chat history will now be persistent and accessible from any device!
