// Example: How to use chat_history table with Supabase
import { supabase } from './lib/supabase';

// ============================================
// TYPES
// ============================================
type SenderType = 'user' | 'ai';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender_type: SenderType;
  created_at: string;
  updated_at: string;
}

// ============================================
// 1. SAVE NEW MESSAGE
// ============================================
async function saveMessage(
  userId: string,
  message: string,
  senderType: SenderType
): Promise<{ success: boolean; data?: ChatMessage; error?: string }> {
  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: userId,
      message: message,
      sender_type: senderType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ChatMessage };
}

// ============================================
// 2. SAVE USER AND AI MESSAGE PAIR
// ============================================
async function saveChatExchange(
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<{ success: boolean; error?: string }> {
  // Save both messages in a transaction-like manner
  const { error } = await supabase
    .from('chat_history')
    .insert([
      {
        user_id: userId,
        message: userMessage,
        sender_type: 'user',
      },
      {
        user_id: userId,
        message: aiResponse,
        sender_type: 'ai',
      },
    ]);

  if (error) {
    console.error('Error saving chat exchange:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// 3. FETCH ALL MESSAGES FOR A USER
// ============================================
async function getUserChatHistory(
  userId: string
): Promise<{ success: boolean; data?: ChatMessage[]; error?: string }> {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat history:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ChatMessage[] };
}

// ============================================
// 4. FETCH RECENT MESSAGES (with limit)
// ============================================
async function getRecentMessages(
  userId: string,
  limit: number = 50
): Promise<{ success: boolean; data?: ChatMessage[]; error?: string }> {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent messages:', error.message);
    return { success: false, error: error.message };
  }

  // Reverse to get chronological order
  return { success: true, data: (data as ChatMessage[]).reverse() };
}

// ============================================
// 5. DELETE ALL CHAT HISTORY FOR USER
// ============================================
async function clearChatHistory(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing chat history:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// 6. DELETE SPECIFIC MESSAGE
// ============================================
async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// 7. REAL-TIME SUBSCRIPTION (Optional)
// ============================================
function subscribeToChatHistory(
  userId: string,
  onNewMessage: (message: ChatMessage) => void
) {
  const channel = supabase
    .channel('chat_history_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_history',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNewMessage(payload.new as ChatMessage);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// REACT COMPONENT EXAMPLE
// ============================================
import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

function ChatHistoryComponent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    if (user?.email) {
      loadChatHistory();
    }
  }, [user]);

  async function loadChatHistory() {
    if (!user?.email) return;

    setLoading(true);
    
    // Get user ID from auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const result = await getUserChatHistory(authUser.id);
    if (result.success && result.data) {
      setMessages(result.data);
    }
    setLoading(false);
  }

  async function handleSendMessage() {
    if (!inputMessage.trim() || !user?.email) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Save user message
    const userResult = await saveMessage(authUser.id, inputMessage, 'user');
    if (!userResult.success) {
      console.error('Failed to save message');
      return;
    }

    // Simulate AI response (replace with actual AI call)
    const aiResponse = `AI response to: ${inputMessage}`;
    const aiResult = await saveMessage(authUser.id, aiResponse, 'ai');

    if (userResult.data && aiResult.data) {
      setMessages([...messages, userResult.data, aiResult.data]);
    }

    setInputMessage('');
  }

  async function handleClearHistory() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const result = await clearChatHistory(authUser.id);
    if (result.success) {
      setMessages([]);
    }
  }

  return (
    <div>
      <h2>Chat History</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {messages.map((msg) => (
            <div key={msg.id} className={msg.sender_type}>
              <strong>{msg.sender_type === 'user' ? 'You' : 'AI'}:</strong>
              <p>{msg.message}</p>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={handleClearHistory}>Clear History</button>
    </div>
  );
}

export {
  saveMessage,
  saveChatExchange,
  getUserChatHistory,
  getRecentMessages,
  clearChatHistory,
  deleteMessage,
  subscribeToChatHistory,
  ChatHistoryComponent,
};

export type { ChatMessage, SenderType };
