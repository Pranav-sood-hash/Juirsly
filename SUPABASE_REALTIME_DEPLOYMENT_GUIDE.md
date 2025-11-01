# Supabase Realtime & Deployment Guide

Complete guide for setting up Supabase Realtime for live chat updates and deploying your Supabase project to production.

## Table of Contents
1. [Enable Supabase Realtime](#enable-supabase-realtime)
2. [Deployment Options](#deployment-options)
3. [React Implementation](#react-implementation)
4. [Production Checklist](#production-checklist)

---

## 1. Enable Supabase Realtime

### Step 1: Create Chat History Table

Run this SQL in your Supabase SQL Editor (Database → SQL Editor):

```sql
-- Create chat_history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_conversation_id ON chat_history(conversation_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at DESC);
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own chat history
CREATE POLICY "Users can view own chats" 
  ON chat_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own chats" 
  ON chat_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own messages
CREATE POLICY "Users can update own chats" 
  ON chat_history FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own chats" 
  ON chat_history FOR DELETE 
  USING (auth.uid() = user_id);
```

### Step 3: Enable Realtime Replication

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Database** → **Replication**
2. Find `chat_history` table
3. Toggle **Enable Realtime** switch to ON

**Option B: Via SQL**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE chat_history;
```

### Step 4: Verify Realtime is Enabled

```sql
-- Check if table is replicated
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see `chat_history` in the results.

---

## 2. Deployment Options

### Option A: Supabase Cloud (Recommended for Most Apps)

**Pros:**
- ✅ Fully managed (no DevOps)
- ✅ Auto-scaling
- ✅ Daily backups (Pro tier)
- ✅ Built-in monitoring
- ✅ Fast global CDN

**Cons:**
- ❌ Monthly costs ($25+ for production)
- ❌ Less control over infrastructure

**Setup Steps:**

1. **Create Account & Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose region closest to your users
   - Set strong database password

2. **Get API Credentials**
   - Navigate to **Settings** → **API**
   - Copy **Project URL** → `VITE_SUPABASE_URL`
   - Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

3. **Configure Authentication**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `https://your-app-domain.com`
   - Add **Redirect URLs**: 
     - `https://your-app-domain.com/auth/callback`
     - `https://your-replit-domain.repl.co/auth/callback` (for Replit)

4. **Set Up Email Provider (Production)**
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Use AWS SES, SendGrid, or Mailgun
   - Configure custom email templates

5. **Enable Features**
   - **Authentication** → **Providers** → Enable Email
   - **Database** → **Replication** → Enable for `chat_history`
   - **API** → **Settings** → Configure rate limits

**Pricing (2025):**

| Plan | Cost | Database | Storage | Egress | MAU |
|------|------|----------|---------|--------|-----|
| **Free** | $0 | 500MB | 1GB | 2GB | 50k |
| **Pro** | $25/mo | 8GB | 100GB | 250GB | 100k |
| **Team** | $599/mo | Custom | Custom | Custom | Custom |

**Important:**
- Free tier pauses after 7 days of inactivity (NOT for production)
- Pro tier minimum for production apps
- Spending caps available to prevent surprise bills

---

### Option B: Self-Hosted (Docker)

**Pros:**
- ✅ Full control
- ✅ Data sovereignty
- ✅ Cost-effective at scale
- ✅ Customizable

**Cons:**
- ❌ Requires DevOps expertise
- ❌ Manual updates and maintenance
- ❌ Need to manage backups

**Quick Setup:**

```bash
# Clone Supabase repository
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Generate JWT secret (save this!)
openssl rand -base64 32

# Generate anon and service_role keys
# Use: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

# Edit .env file
nano .env

# Update these values:
# JWT_SECRET=<your-generated-secret>
# ANON_KEY=<generated-anon-jwt>
# SERVICE_ROLE_KEY=<generated-service-role-jwt>
# SITE_URL=https://your-domain.com
# API_EXTERNAL_URL=https://your-domain.com
# SUPABASE_PUBLIC_URL=https://your-domain.com

# Start Supabase
docker compose up -d

# Check status
docker compose ps
```

**Services Running:**
- **Kong** (API Gateway) - Port 8000
- **PostgreSQL** (Database) - Port 5432
- **GoTrue** (Auth) - Port 9999
- **PostgREST** (API) - Port 3000
- **Realtime** (WebSocket) - Port 4000
- **Studio** (Dashboard) - Port 3001
- **Storage** (S3-compatible) - Port 5000

**Production Setup:**

1. **SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot nginx
certbot certonly --standalone -d yourdomain.com
```

2. **Nginx Reverse Proxy**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for Realtime
    location /realtime/v1/websocket {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

3. **Automated Backups**
```bash
# Create backup script
cat > /opt/supabase-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/supabase"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec supabase-db pg_dumpall -U postgres > "$BACKUP_DIR/backup_$DATE.sql"
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /opt/supabase-backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /opt/supabase-backup.sh
```

**Resource Requirements:**
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **Storage**: 50GB+ SSD

---

### Option C: Replit Deployment (Your Current Setup)

**For Development:**
- Uses Replit Secrets for environment variables
- Auto-deploys on code changes
- Perfect for prototyping

**For Production:**
- Click **Deploy** button in Replit
- Choose **Autoscale** deployment (for stateless apps)
- Or **VM** deployment (for stateful apps with WebSockets)
- Configure custom domain
- Set environment variables in deployment settings

---

## 3. React Implementation

### Setup: Custom Hook for Realtime Chat

Create `src/hooks/useRealtimeChat.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  conversation_id?: string;
  created_at: string;
}

export function useRealtimeChat(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Send a new message
  const sendMessage = useCallback(async (message: string, role: 'user' | 'assistant' = 'user') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return null;
      }

      const newMessage = {
        user_id: user.id,
        message,
        role,
        conversation_id: conversationId,
      };

      const { data, error } = await supabase
        .from('chat_history')
        .insert(newMessage)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }, [conversationId]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return false;
    }
  }, []);

  // Setup Realtime subscription
  useEffect(() => {
    fetchMessages();

    const { data: { user } } = supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      // Create channel for realtime updates
      const realtimeChannel = supabase
        .channel(`chat-${conversationId || 'all'}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${data.user.id}`,
          },
          (payload) => {
            console.log('New message received:', payload.new);
            const newMessage = payload.new as ChatMessage;
            
            // Only add if matches current conversation
            if (!conversationId || newMessage.conversation_id === conversationId) {
              setMessages((current) => {
                // Avoid duplicates
                if (current.find(msg => msg.id === newMessage.id)) {
                  return current;
                }
                return [...current, newMessage];
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${data.user.id}`,
          },
          (payload) => {
            console.log('Message updated:', payload.new);
            const updatedMessage = payload.new as ChatMessage;
            setMessages((current) =>
              current.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${data.user.id}`,
          },
          (payload) => {
            console.log('Message deleted:', payload.old);
            const deletedMessage = payload.old as ChatMessage;
            setMessages((current) =>
              current.filter((msg) => msg.id !== deletedMessage.id)
            );
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      setChannel(realtimeChannel);
    });

    // Cleanup
    return () => {
      if (channel) {
        console.log('Unsubscribing from realtime channel');
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
```

### Usage in Chat Component

Update your chat component to use the realtime hook:

```typescript
import { useRealtimeChat } from '../hooks/useRealtimeChat';

export function ChatPage() {
  const { messages, loading, sendMessage } = useRealtimeChat();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Send user message
    await sendMessage(input, 'user');
    setInput('');
    
    // Simulate AI response (replace with actual AI call)
    setTimeout(async () => {
      await sendMessage('This is an AI response', 'assistant');
    }, 1000);
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <p>{msg.message}</p>
            <span className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

### Alternative: Update Existing ChatContext

If you want to integrate with your existing `ChatContext`, add realtime support:

```typescript
// In src/contexts/ChatContext.tsx
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Add to ChatContext
useEffect(() => {
  const { data: { user } } = supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return;

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_history',
          filter: `user_id=eq.${data.user.id}`,
        },
        (payload) => {
          // Update your chat state here
          console.log('New message:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });
}, []);
```

---

## 4. Production Checklist

### Before Going Live

**Supabase Configuration:**
- [ ] Enable RLS on all tables
- [ ] Test RLS policies thoroughly
- [ ] Configure production email provider (SMTP)
- [ ] Set up custom email templates
- [ ] Configure Site URL and Redirect URLs
- [ ] Enable database backups (Pro tier)
- [ ] Set up monitoring and alerts

**Application:**
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Optimistic UI updates for better UX
- [ ] Message pagination (for large chat histories)
- [ ] Rate limiting on message sending
- [ ] Input validation and sanitization

**Security:**
- [ ] Never expose `service_role` key in frontend
- [ ] Use HTTPS only
- [ ] Enable CORS properly
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Regular security audits

**Performance:**
- [ ] Implement message pagination
- [ ] Add indexes to frequently queried columns
- [ ] Use connection pooling
- [ ] Monitor database performance
- [ ] Optimize Realtime subscriptions (use filters)

**Testing:**
- [ ] Test realtime updates across multiple tabs
- [ ] Test with poor network conditions
- [ ] Test reconnection after network loss
- [ ] Load testing for concurrent users
- [ ] Cross-browser compatibility

---

## Troubleshooting

### Realtime Not Working

1. **Check table replication is enabled**
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

2. **Verify RLS policies allow SELECT**
- Realtime requires SELECT permission
- Check policies in Database → Policies

3. **Check browser console for errors**
- Look for WebSocket connection errors
- Verify Supabase client initialization

4. **Test with public table first**
- Create a test table without RLS
- If it works, issue is with RLS policies

### Messages Not Appearing

1. **Check user authentication**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

2. **Verify filter is correct**
- User ID should match authenticated user
- Conversation ID should match (if filtering)

3. **Check for duplicate subscriptions**
- Ensure cleanup in useEffect return
- Use React StrictMode carefully (causes double subscriptions in dev)

### Performance Issues

1. **Add filters to subscriptions**
```typescript
filter: `user_id=eq.${userId}` // Only listen to relevant changes
```

2. **Implement pagination**
```typescript
const { data } = await supabase
  .from('chat_history')
  .select('*')
  .range(0, 49) // First 50 messages
  .order('created_at', { ascending: false });
```

3. **Unsubscribe when not needed**
- Always cleanup in useEffect return
- Unsubscribe when switching conversations

---

## Next Steps

1. **Implement message persistence** - Save all chats to Supabase
2. **Add typing indicators** - Use Supabase Presence
3. **Multiple conversations** - Add conversation management
4. **Message reactions** - Store in separate table
5. **File uploads** - Use Supabase Storage
6. **Search** - Full-text search on messages

---

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres Changes Guide](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
