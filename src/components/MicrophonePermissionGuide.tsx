import { motion } from 'motion/react';
import { X, Mic, Chrome, Settings } from 'lucide-react';

interface MicrophonePermissionGuideProps {
  onClose: () => void;
}

export function MicrophonePermissionGuide({ onClose }: MicrophonePermissionGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-4 sm:my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-2xl text-white flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Mic className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <span className="line-clamp-1">Enable Microphone Access</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all flex-shrink-0"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 smooth-scroll">
          <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
            <p className="text-white/70 text-sm sm:text-base">
              To use voice input, Jurisly needs access to your microphone. Follow these steps:
            </p>

            {/* Chrome Instructions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Chrome className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
                <h3 className="text-white text-base sm:text-lg font-medium">Chrome / Edge / Brave</h3>
              </div>
              <ol className="space-y-2 text-white/70 text-xs sm:text-sm list-decimal list-inside">
                <li>Click the 🔒 lock icon or ⓘ info icon in the address bar</li>
                <li>Find "Microphone" in the permissions list</li>
                <li>Change it from "Block" to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>

            {/* Safari Instructions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
                <h3 className="text-white text-base sm:text-lg font-medium">Safari</h3>
              </div>
              <ol className="space-y-2 text-white/70 text-xs sm:text-sm list-decimal list-inside">
                <li>Open Safari → Settings (or Preferences)</li>
                <li>Go to "Websites" tab</li>
                <li>Click "Microphone" in the left sidebar</li>
                <li>Find this website and set to "Allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>

            {/* Alternative: Type instead */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-4 sm:p-5">
              <h3 className="text-cyan-400 mb-2 text-base sm:text-lg font-medium">Alternative Option</h3>
              <p className="text-white/70 text-xs sm:text-sm">
                You can still use Jurisly by typing your questions. Voice input is optional!
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
