import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

/* --- "Typing..." Animation ---
   Shows animated dots while AI is processing response
   Left-aligned to match AI message bubble style
--- Animation End --- */

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-start mb-6"
    >
      <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
        {/* Avatar */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-lg shadow-purple-500/50 flex items-center justify-center"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
          }}
        >
          <Brain className="w-6 h-6 text-white" />
        </motion.div>

        {/* Typing Bubble */}
        <div 
          className="rounded-2xl p-4 backdrop-blur-xl bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-blue-900/40 border border-purple-500/20 shadow-lg"
          style={{
            boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.08), 0 4px 20px rgba(139, 92, 246, 0.15)',
          }}
        >
          <div className="flex gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              className="w-2.5 h-2.5 rounded-full bg-purple-400"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              className="w-2.5 h-2.5 rounded-full bg-indigo-400"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              className="w-2.5 h-2.5 rounded-full bg-blue-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
