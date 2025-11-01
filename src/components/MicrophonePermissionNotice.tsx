import { motion } from 'motion/react';
import { Mic, X } from 'lucide-react';

interface MicrophonePermissionNoticeProps {
  onDismiss: () => void;
}

export function MicrophonePermissionNotice({ onDismiss }: MicrophonePermissionNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-md"
    >
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-900/90 to-pink-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-500/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
            <Mic className="w-5 h-5 text-purple-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">Microphone Permission Required</h4>
            <p className="text-white/70 text-sm">
              Please allow microphone access when your browser asks. This enables voice input features.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
