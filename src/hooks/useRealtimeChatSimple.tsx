import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface UseRealtimeChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (message: string, role?: 'user' | 'assistant') => Promise<ChatMessage | null>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  clearMessages: () => Promise<boolean>;
}

export function useRealtimeChatSimple(): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    message: string, 
    role: 'user' | 'assistant' = 'user'
  ): Promise<ChatMessage | null> => {
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

      return data as ChatMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
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

  const clearMessages = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing messages:', error);
        return false;
      }

      setMessages([]);
      return true;
    } catch (error) {
      console.error('Error in clearMessages:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let realtimeChannel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      await fetchMessages();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user, skipping realtime setup');
        return;
      }

      const channelName = `chat-simple-${user.id}`;
      console.log('Setting up realtime channel:', channelName);

      realtimeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New message received:', payload.new);
            const newMessage = payload.new as ChatMessage;
            
            setMessages((current) => {
              if (current.find(msg => msg.id === newMessage.id)) {
                return current;
              }
              return [...current, newMessage];
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${user.id}`,
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
            filter: `user_id=eq.${user.id}`,
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
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to realtime channel');
          }
        });

      setChannel(realtimeChannel);
    };

    setupRealtime();

    return () => {
      if (realtimeChannel) {
        console.log('Cleaning up realtime channel');
        supabase.removeChannel(realtimeChannel);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
    clearMessages,
  };
}
