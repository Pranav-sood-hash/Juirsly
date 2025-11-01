import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Download, 
  X,
  Menu,
  ChevronLeft,
  Clock
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { useState } from 'react';

/* --- Navbar Flexibility Start ---
   ChatGPT-style collapsible sidebar
   Features:
   - New Chat button at top
   - Scrollable list of past conversations
   - Delete individual chats
   - Export options
   - Responsive: 
     * Desktop: Collapsible sidebar (left)
     * Mobile: Hamburger menu overlay
   
   Use React state to toggle sidebar visibility
   Tailwind responsive classes:
   - hidden md:flex for desktop
   - block md:hidden for mobile
--- Navbar Flexibility End --- */

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAll: () => void;
  onClearAll: () => void;
}

export function ChatSidebar({ isOpen, onClose, onExportAll, onClearAll }: ChatSidebarProps) {
  const { 
    conversations, 
    currentConversationId, 
    createNewChat, 
    switchConversation,
    deleteConversation,
    exportConversation
  } = useChat();
  const { language } = useSettings();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const translations = {
    en: {
      newChat: 'New Chat',
      recentChats: 'Recent Conversations',
      exportAll: 'Export All',
      clearAll: 'Clear All',
      delete: 'Delete',
      export: 'Export',
      empty: 'No conversations yet',
      startNew: 'Start a new chat!',
    },
    hi: {
      newChat: 'नई चैट',
      recentChats: 'हाल की बातचीत',
      exportAll: 'सभी निर्यात करें',
      clearAll: 'सभी साफ़ करें',
      delete: 'हटाएं',
      export: 'निर्यात',
      empty: 'अभी तक कोई बातचीत नहीं',
      startNew: 'नई चैट शुरू करें!',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleNewChat = () => {
    createNewChat();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSwitchChat = (conversationId: string) => {
    switchConversation(conversationId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
    }
  };

  const handleExportChat = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    exportConversation(conversationId, 'txt');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-slate-900/95 via-purple-900/80 to-slate-900/95 backdrop-blur-2xl border-r border-white/10 z-40 flex flex-col shadow-2xl"
        style={{
          boxShadow: '0 0 80px rgba(168, 85, 247, 0.15)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-white">Jurisly</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <p className="text-white/50 text-sm px-3 mb-2">{t.recentChats}</p>
          
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">{t.empty}</p>
              <p className="text-white/30 text-xs mt-1">{t.startNew}</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onMouseEnter={() => setHoveredId(conversation.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSwitchChat(conversation.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                  currentConversationId === conversation.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate mb-1">
                      {conversation.title}
                    </p>
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(conversation.updatedAt)}</span>
                      <span>•</span>
                      <span>{conversation.messages.length} msgs</span>
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  {hoveredId === conversation.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <button
                        onClick={(e) => handleExportChat(e, conversation.id)}
                        className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 transition-all"
                        title={t.export}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(e, conversation.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-all"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Active Indicator */}
                {currentConversationId === conversation.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onExportAll}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportAll}</span>
          </button>
          <button
            onClick={onClearAll}
            className="w-full py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.clearAll}</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
