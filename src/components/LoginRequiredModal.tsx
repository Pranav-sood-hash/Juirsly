import { motion } from 'motion/react';
import { Lock, LogIn } from 'lucide-react';

interface LoginRequiredModalProps {
  onLogin: () => void;
}

export function LoginRequiredModal({ onLogin }: LoginRequiredModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/50">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl text-white text-center mb-4">
          Authentication Required
        </h2>

        {/* Message */}
        <p className="text-white/70 text-center mb-8">
          Please login to start conversation with AI Agent.
          <br />
          <span className="text-sm text-white/50 mt-2 block">
            Secure your legal consultations with a free account.
          </span>
        </p>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Go to Login
        </button>
      </motion.div>
    </motion.div>
  );
}
