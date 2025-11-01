import { useState } from 'react';
import { Send, Mic, MicOff, HelpCircle } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { MicrophonePermissionGuide } from './MicrophonePermissionGuide';
import { AnimatePresence } from 'motion/react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/* --- Message Input Component ---
   Sticky input field at bottom with:
   - Text input for typing messages
   - Voice input button with Web Speech API
   - Send button with neon gradient effect
   - Disabled state while AI is responding

   Voice Integration:
   - Uses Web Speech API for speech recognition
   - Requires microphone permission
   - Supports English and Hindi languages
   - Shows permission status and help guide

   n8n Integration Placeholder:
   When user sends message via text or voice, it's passed to parent
   for processing through n8n workflow API
--- Message Input End --- */

export function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showMicHelp, setShowMicHelp] = useState(false);
  const { isListening, startListening, stopListening, isSupported, permissionGranted } = useVoiceAssistant();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setMessage(transcript);
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl bg-gradient-to-t from-slate-900/80 to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={disabled}
              placeholder={placeholder || "Type a message to Jurisly…"}
              className="w-full px-6 py-4 pr-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50"
            />
            
            {/* Voice Input Button */}
            {isSupported && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={disabled}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50 animate-pulse'
                      : permissionGranted === false
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={
                    isListening 
                      ? 'Stop listening' 
                      : permissionGranted === false
                      ? 'Microphone access denied - click help (?)'
                      : 'Voice input (click for voice)'
                  }
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {permissionGranted === false && !isListening && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                  )}
                </button>
                
                {/* Help Icon */}
                <button
                  type="button"
                  onClick={() => setShowMicHelp(true)}
                  className={`w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all ${
                    permissionGranted === false
                      ? 'text-red-400 hover:text-red-300 animate-pulse'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                  title="Microphone help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Microphone Help Modal */}
      <AnimatePresence>
        {showMicHelp && <MicrophonePermissionGuide onClose={() => setShowMicHelp(false)} />}
      </AnimatePresence>
    </>
  );
}
