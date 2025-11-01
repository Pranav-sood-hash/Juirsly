import { motion } from 'motion/react';
import { Brain, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  relevance?: number;
  delay?: number;
}

/* --- Chat Message Bubble Design ---
   User messages: Right-aligned, soft blue gradient bubble
   AI messages: Left-aligned, glassy law-themed gradient (purple-black-blue)
   Center-aligned layout with smooth animations and responsive styling

   Message storage format:
   { id, sender: 'user'|'ai', text, timestamp, relevance?: number }

   Styling:
   - User: Blue gradient (from-blue-600 to-cyan-600)
   - AI: Purple-black-blue gradient (from-purple-900 via-slate-900 to-blue-900)
   - Backdrop blur for glassy effect
   - Responsive max-width: 85% on mobile, 75% on desktop
--- Chat Message Bubble Design End --- */

export function ChatMessage({ message, isAI, relevance, delay = 0 }: ChatMessageProps) {
  const { user } = useAuth();

  // Get user avatar if available
  const userAvatar = user?.avatar;

  const getAvatarDisplay = () => {
    if (isAI) {
      return <Brain className="w-6 h-6 text-white" />;
    }

    // If user has custom avatar, show it
    if (userAvatar) {
      const LAW_AVATARS = {
        male: [
          { id: 'm1', emoji: '👨‍⚖️' },
          { id: 'm2', emoji: '🧑‍💼' },
          { id: 'm3', emoji: '👔' },
          { id: 'm4', emoji: '🎓' },
          { id: 'm5', emoji: '⚖️' },
        ],
        female: [
          { id: 'f1', emoji: '👩‍⚖️' },
          { id: 'f2', emoji: '👩‍💼' },
          { id: 'f3', emoji: '💼' },
          { id: 'f4', emoji: '📚' },
          { id: 'f5', emoji: '⚖️' },
        ],
      };

      const allAvatars = [...LAW_AVATARS.male, ...LAW_AVATARS.female];
      const avatar = allAvatars.find(a => a.id === userAvatar);

      if (avatar) {
        return <span className="text-2xl">{avatar.emoji}</span>;
      }
    }

    return <User className="w-6 h-6 text-white" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`w-full flex ${isAI ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isAI
              ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-purple-500/50'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/50'
          }`}
          style={{
            boxShadow: isAI 
              ? '0 0 20px rgba(139, 92, 246, 0.4)' 
              : '0 0 20px rgba(59, 130, 246, 0.4)',
          }}
        >
          {getAvatarDisplay()}
        </motion.div>

        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
          className={`rounded-2xl p-4 backdrop-blur-xl border shadow-lg ${
            isAI
              ? 'bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-blue-900/40 border-purple-500/20 shadow-purple-500/10'
              : 'bg-gradient-to-br from-blue-600/80 to-cyan-600/80 border-blue-400/30 shadow-blue-500/20'
          }`}
          style={{
            boxShadow: isAI 
              ? 'inset 0 0 40px rgba(139, 92, 246, 0.08), 0 4px 20px rgba(139, 92, 246, 0.15)' 
              : 'inset 0 0 40px rgba(59, 130, 246, 0.15), 0 4px 20px rgba(59, 130, 246, 0.25)',
          }}
        >
          <div className={`leading-relaxed whitespace-pre-line ${
            isAI ? 'text-white/95' : 'text-white'
          }`}>
            {message}
          </div>
          
          {relevance !== undefined && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Relevance:</span>
                <span className="text-sm text-cyan-400">{relevance}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${relevance}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
