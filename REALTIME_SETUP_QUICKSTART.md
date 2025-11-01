# Supabase Realtime - Quick Start Guide

This guide will get your real-time chat feature up and running in 5 minutes.

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Environment variables configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- ✅ User authentication working

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Schema

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Database** → **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase_chat_history_schema.sql`
5. Click **Run** or press `Ctrl/Cmd + Enter`

✅ This creates:
- `chat_history` table
- Row Level Security policies
- Performance indexes
- Realtime replication

### Step 2: Verify Realtime is Enabled

Option A: **Dashboard UI**
1. Go to **Database** → **Replication**
2. Find `chat_history` table
3. Ensure the toggle is **ON** (green)

Option B: **SQL Verification**
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see `chat_history` in the results.

### Step 3: Use the Hook in Your Component

```typescript
import { useRealtimeChat } from '../hooks/useRealtimeChat';

function ChatPage() {
  const { messages, loading, sendMessage } = useRealtimeChat();

  const handleSend = async (text: string) => {
    await sendMessage(text, 'user');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.message}</div>
      ))}
      <button onClick={() => handleSend('Hello!')}>Send</button>
    </div>
  );
}
```

## ✨ That's it! You now have real-time chat.

---

## 📖 What You Have Access To

### Custom Hook: `useRealtimeChat`

Located at: `src/hooks/useRealtimeChat.tsx`

**Features:**
- ✅ Fetch initial messages
- ✅ Real-time updates (INSERT, UPDATE, DELETE)
- ✅ Send messages
- ✅ Delete messages
- ✅ Clear conversation
- ✅ Auto-cleanup on unmount

**API:**
```typescript
const {
  messages,      // Array of messages
  loading,       // Initial load state
  sendMessage,   // (message, role) => Promise
  deleteMessage, // (messageId) => Promise
  refetch,       // () => void - Manually refresh
  clearMessages  // () => Promise - Clear all
} = useRealtimeChat(conversationId?);
```

### Example Component

Located at: `src/components/RealtimeChatExample.tsx`

Full-featured example showing:
- Message display
- Send/delete functionality
- Loading states
- Real-time updates
- Beautiful UI

**To test it:**
```typescript
// In src/App.tsx, temporarily replace ChatPage with:
import { RealtimeChatExample } from './components/RealtimeChatExample';

// Then in your render:
<RealtimeChatExample />
```

---

## 🧪 Testing Realtime

### Test Real-time Updates:

1. **Open your app in two browser tabs**
2. **Login with the same account in both**
3. **Send a message in Tab 1**
4. **Watch it appear instantly in Tab 2**

### Debugging:

**Check browser console for:**
```
Setting up realtime channel: chat-all-[user-id]
Realtime subscription status: SUBSCRIBED
Successfully subscribed to realtime updates
```

**If you see errors:**
- Verify RLS policies allow SELECT on `chat_history`
- Check that table replication is enabled
- Ensure you're authenticated
- Clear cache and reload

---

## 🔧 Integration with Existing Chat

To integrate with your current `ChatContext`:

```typescript
// In src/contexts/ChatContext.tsx
import { useRealtimeChat } from '../hooks/useRealtimeChat';

export function ChatProvider({ children }: { children: ReactNode }) {
  const { messages, sendMessage } = useRealtimeChat();
  
  // Use messages and sendMessage in your context
  // Remove local state management - Supabase handles it now
  
  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
```

---

## 📚 Documentation Files

- **`SUPABASE_REALTIME_DEPLOYMENT_GUIDE.md`** - Complete guide (deployment, hosting, advanced features)
- **`SUPABASE_INTEGRATION_GUIDE.md`** - Authentication & client setup
- **`supabase_chat_history_schema.sql`** - Database schema with realtime

---

## 🎯 Next Steps

### Basic (Works Now)
- ✅ Real-time message sync
- ✅ User authentication
- ✅ Message persistence

### Enhancements (Optional)

1. **Multiple Conversations**
   - Pass `conversationId` to `useRealtimeChat()`
   - Create conversations table (see SQL file)

2. **Typing Indicators**
   - Use Supabase Presence
   - Show when others are typing

3. **Read Receipts**
   - Add `read` boolean to messages
   - Update on message view

4. **File Attachments**
   - Use Supabase Storage
   - Store file URLs in messages

5. **Message Reactions**
   - Create `message_reactions` table
   - Real-time reaction updates

---

## 🚨 Common Issues

### Messages not appearing in real-time

**Check:**
1. Realtime enabled on table (Database → Replication)
2. RLS policy allows SELECT for current user
3. User is authenticated
4. Browser console for errors

**Fix:**
```sql
-- Verify RLS allows SELECT
SELECT * FROM pg_policies WHERE tablename = 'chat_history';
```

### Duplicate messages

**Cause:** React StrictMode in development
**Fix:** Already handled in the hook - duplicates are filtered

### Connection drops

**Cause:** Network issues
**Fix:** Supabase automatically reconnects. Messages are persisted in DB.

---

## 💡 Pro Tips

1. **Use conversation IDs** for better organization
2. **Add pagination** for performance with many messages
3. **Implement optimistic UI** for instant feedback
4. **Add error boundaries** for better error handling
5. **Monitor Supabase dashboard** for usage and errors

---

## 🎉 You're All Set!

Your real-time chat is now:
- ✅ Syncing across devices
- ✅ Secured with RLS
- ✅ Persistent in database
- ✅ Scalable to production

Need help? Check the comprehensive guides or your Supabase dashboard logs.
