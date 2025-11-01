import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';

/* --- Voice Assistant Logic ---
   This hook manages speech-to-text and text-to-speech functionality
   Uses Web Speech API (works in Chrome, Edge, Safari)
   For production, consider using cloud services like Google Cloud Speech
   or Azure Speech Services for better accuracy and language support
--- */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useVoiceAssistant() {
  const { language, voiceEnabled, aiMode } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        setRecognition(recognitionInstance);
      }
    }
  }, [language]);

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionGranted(result.state === 'granted');
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionGranted(result.state === 'granted');
          });
        }
      } catch (error) {
        // Permissions API might not be supported, will handle on first use
        console.log('Permissions API not supported, will request on first use');
      }
    };
    
    checkPermission();
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Try to get microphone access using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately - we just needed to trigger permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.log('Microphone permission denied:', error);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const startListening = useCallback(
    async (onResult: (transcript: string) => void) => {
      if (!voiceEnabled) {
        toast.error(language === 'en' ? 'Voice is disabled in settings' : 'सेटिंग्स में वॉयस अक्षम है');
        return;
      }

      if (!recognition) {
        toast.error(
          language === 'en'
            ? 'Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.'
            : 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। Chrome, Edge, या Safari का उपयोग करें।'
        );
        return;
      }

      // Check and request permission if not already granted
      if (permissionGranted === false) {
        toast.error(
          language === 'en'
            ? '🎤 Microphone access was denied. Please click the help (?) button to learn how to enable it.'
            : '🎤 माइक्रोफ़ोन एक्सेस अस्वीकृत किया गया था। इसे सक्षम करने के लिए कृपया हेल्प (?) बटन पर क्लिक करें।',
          { duration: 5000 }
        );
        return;
      }

      if (permissionGranted === null) {
        // First time asking for permission
        toast.info(
          language === 'en'
            ? 'Requesting microphone access...'
            : 'माइक्रोफ़ोन एक्सेस का अनुरोध किया जा रहा है...'
        );
        
        const granted = await requestMicrophonePermission();
        if (!granted) {
          toast.error(
            language === 'en'
              ? '🎤 Microphone access denied. Please click the help (?) button for instructions.'
              : '🎤 माइक्रोफ़ोन एक्सेस अस्वीकृत। निर्देशों के लिए कृपया हेल्प (?) बटन पर क्लिक करें।',
            { duration: 5000 }
          );
          return;
        }
      }

      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
        toast.success(language === 'en' ? '✓ Voice captured' : '✓ आवाज़ कैप्चर की गई');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        
        // Handle specific error types
        switch (event.error) {
          case 'not-allowed':
            setPermissionGranted(false);
            toast.error(
              language === 'en'
                ? '🎤 Microphone access denied. Click the help (?) button for instructions on enabling it.'
                : '🎤 माइक्रोफ़ोन एक्सेस अस्वीकृत। इसे सक्षम करने के लिए हेल्प (?) बटन पर क्लिक करें।',
              { duration: 5000 }
            );
            break;
          case 'no-speech':
            toast.info(
              language === 'en'
                ? 'No speech detected. Please try again.'
                : 'कोई भाषण नहीं पाया गया। कृपया पुनः प्रयास करें।'
            );
            break;
          case 'audio-capture':
            toast.error(
              language === 'en'
                ? 'No microphone found. Please connect a microphone.'
                : 'कोई माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन कनेक्ट करें।'
            );
            break;
          case 'network':
            toast.error(
              language === 'en'
                ? 'Network error. Please check your internet connection.'
                : 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।'
            );
            break;
          case 'aborted':
            // User stopped it, don't show error
            break;
          default:
            toast.error(
              language === 'en'
                ? 'Failed to recognize speech. Please try again.'
                : 'भाषण पहचानने में विफल। कृपया पुनः प्रयास करें।'
            );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
        setIsListening(true);
        toast.success(language === 'en' ? '🎤 Listening...' : '🎤 सुन रहा हूं...');
      } catch (error: any) {
        setIsListening(false);
        // Check if it's because recognition is already started
        if (error?.message?.includes('already started')) {
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
              setIsListening(true);
              toast.success(language === 'en' ? '🎤 Listening...' : '🎤 सुन रहा हूं...');
            } catch (retryError) {
              toast.error(
                language === 'en'
                  ? 'Could not start voice recognition. Please try again.'
                  : 'वॉइस रिकग्निशन शुरू नहीं हो सका। कृपया पुनः प्रयास करें।'
              );
            }
          }, 100);
        } else {
          toast.error(
            language === 'en'
              ? 'Could not start voice recognition. Please try again.'
              : 'वॉइस रिकग्निशन शुरू नहीं हो सका। कृपया पुनः प्रयास करें।'
          );
        }
      }
    },
    [recognition, voiceEnabled, language, permissionGranted, requestMicrophonePermission]
  );

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || aiMode === 'text') {
        return;
      }

      if (!('speechSynthesis' in window)) {
        console.error('Text-to-speech not supported');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, language, aiMode]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: !!recognition,
    permissionGranted,
    requestMicrophonePermission,
  };
}
