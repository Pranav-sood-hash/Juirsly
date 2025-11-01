import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Globe, Mic, Brain, Palette, Bell, Trash2, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { useSettings, Theme, AIMode } from '../contexts/SettingsContext';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { MicrophonePermissionGuide } from './MicrophonePermissionGuide';
import { AnimatePresence } from 'motion/react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

interface SettingsPageProps {
  onClose: () => void;
}

export function SettingsPage({ onClose }: SettingsPageProps) {
  const {
    language,
    setLanguage,
    voiceEnabled,
    setVoiceEnabled,
    aiMode,
    setAIMode,
    theme,
    setTheme,
    notificationTone,
    setNotificationTone,
    clearChatHistory,
  } = useSettings();

  const [showMicHelp, setShowMicHelp] = useState(false);
  const { permissionGranted, requestMicrophonePermission } = useVoiceAssistant();
  const [isTestingMic, setIsTestingMic] = useState(false);

  const handleClearHistory = () => {
    clearChatHistory();
    toast.success(language === 'en' ? 'Chat history cleared' : 'चैट इतिहास साफ़ किया गया');
  };

  const handleTestMicrophone = async () => {
    setIsTestingMic(true);
    const granted = await requestMicrophonePermission();
    setIsTestingMic(false);
    
    if (granted) {
      toast.success(
        language === 'en'
          ? '✓ Microphone access granted! You can now use voice input.'
          : '✓ माइक्रोफ़ोन एक्सेस दी गई! अब आप वॉइस इनपुट का उपयोग कर सकते हैं।'
      );
    } else {
      toast.error(
        language === 'en'
          ? 'Microphone access denied. Please check your browser settings.'
          : 'माइक्रोफ़ोन एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स जांचें।'
      );
    }
  };

  const themeGradients = {
    dark: 'from-slate-900 via-cyan-900 to-teal-900',
    purple: 'from-slate-900 via-purple-900 to-pink-900',
    blue: 'from-slate-900 via-blue-900 to-cyan-900',
    custom: 'from-indigo-900 via-purple-900 to-pink-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Language Toggle */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">Language</h3>
                  <p className="text-white/50 text-sm">Choose your preferred language</p>
                </div>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">Voice Settings</h3>
                  <p className="text-white/50 text-sm">Enable voice input and output</p>
                </div>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            {/* Permission Status */}
            {voiceEnabled && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  {permissionGranted === true ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">
                        {language === 'en' ? 'Microphone access granted' : 'माइक्रोफ़ोन एक्सेस दी गई'}
                      </span>
                    </>
                  ) : permissionGranted === false ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">
                        {language === 'en' ? 'Microphone access denied' : 'माइक्रोफ़ोन एक्सेस अस्वीकृत'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">
                        {language === 'en' ? 'Microphone permission not yet requested' : 'माइक्रोफ़ोन अनुमति अभी तक नहीं मांगी गई'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {voiceEnabled && permissionGranted !== true && (
                <button
                  onClick={handleTestMicrophone}
                  disabled={isTestingMic}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" />
                  {isTestingMic
                    ? (language === 'en' ? 'Requesting...' : 'अनुरोध किया जा रहा है...')
                    : (language === 'en' ? 'Request Microphone Access' : 'माइक्रोफ़ोन एक्सेस का अनुरोध करें')
                  }
                </button>
              )}
              
              <button
                onClick={() => setShowMicHelp(true)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm flex items-center justify-center gap-2 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                {language === 'en' ? 'Microphone help & troubleshooting' : 'माइक्रोफ़ोन सहायता और समस्या निवारण'}
              </button>
            </div>
          </div>

          {/* AI Mode */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">AI Mode</h3>
                  <p className="text-white/50 text-sm">Select interaction mode</p>
                </div>
              </div>
              <Select value={aiMode} onValueChange={(value) => setAIMode(value as AIMode)}>
                <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="voice-text">Voice + Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white">Theme Customization</h3>
                <p className="text-white/50 text-sm">Choose your color scheme</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themeGradients).map(([key, gradient]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as Theme)}
                  className={`relative h-20 rounded-xl bg-gradient-to-br ${gradient} border-2 transition-all ${
                    theme === key ? 'border-white scale-105' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm capitalize bg-black/30 px-3 py-1 rounded-full">
                      {key}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Tone */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">Notification Tone</h3>
                  <p className="text-white/50 text-sm">Play sound for new messages</p>
                </div>
              </div>
              <Switch checked={notificationTone} onCheckedChange={setNotificationTone} />
            </div>
          </div>

          {/* Clear Chat History */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">Clear Chat History</h3>
                  <p className="text-white/50 text-sm">Delete all conversation data</p>
                </div>
              </div>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Microphone Help Modal */}
      <AnimatePresence>
        {showMicHelp && <MicrophonePermissionGuide onClose={() => setShowMicHelp(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
