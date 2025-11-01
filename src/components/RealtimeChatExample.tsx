import { useState } from 'react';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { Send, Trash2, RefreshCw } from 'lucide-react';

export function RealtimeChatExample() {
  const { messages, loading, sendMessage, deleteMessage, refetch, clearMessages } = useRealtimeChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    setSending(true);
    try {
      await sendMessage(input, 'user');
      setInput('');
      
      setTimeout(async () => {
        await sendMessage(`AI response to: "${input}"`, 'assistant');
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm('Delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear all messages in this conversation?')) {
      await clearMessages();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-4 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-white font-semibold">Realtime Chat</h1>
          <div className="flex gap-2">
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                    : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.role === 'user' && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="ml-2 hover:opacity-100 transition-opacity"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-xl border-t border-white/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Messages are synced in real-time across all your devices
        </p>
      </div>
    </div>
  );
}
