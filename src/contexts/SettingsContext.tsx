import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'purple' | 'blue' | 'custom';
export type AIMode = 'text' | 'voice-text';

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  notificationTone: boolean;
  setNotificationTone: (enabled: boolean) => void;
  clearChatHistory: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  /* --- Settings State Management ---
     All settings are persisted in localStorage
     In production, sync with backend user preferences API
  --- */
  const [language, setLanguageState] = useState('en');
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const [aiMode, setAIModeState] = useState<AIMode>('text');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [notificationTone, setNotificationToneState] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('jurisly_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguageState(settings.language || 'en');
      setVoiceEnabledState(settings.voiceEnabled ?? true);
      setAIModeState(settings.aiMode || 'text');
      setThemeState(settings.theme || 'dark');
      setNotificationToneState(settings.notificationTone ?? true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: any) => {
    localStorage.setItem('jurisly_settings', JSON.stringify(newSettings));
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    saveSettings({
      language: lang,
      voiceEnabled,
      aiMode,
      theme,
      notificationTone,
    });
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    saveSettings({
      language,
      voiceEnabled: enabled,
      aiMode,
      theme,
      notificationTone,
    });
  };

  const setAIMode = (mode: AIMode) => {
    setAIModeState(mode);
    saveSettings({
      language,
      voiceEnabled,
      aiMode: mode,
      theme,
      notificationTone,
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveSettings({
      language,
      voiceEnabled,
      aiMode,
      theme: newTheme,
      notificationTone,
    });
  };

  const setNotificationTone = (enabled: boolean) => {
    setNotificationToneState(enabled);
    saveSettings({
      language,
      voiceEnabled,
      aiMode,
      theme,
      notificationTone: enabled,
    });
  };

  const clearChatHistory = () => {
    localStorage.removeItem('jurisly_chat_history');
  };

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
