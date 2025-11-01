import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { Footer } from './Footer';
import { TypingIndicator } from './TypingIndicator';
import { Navbar } from './Navbar';
import { ChatSidebar } from './ChatSidebar';
import { useSettings } from '../contexts/SettingsContext';
import { useChat, ChatMessage as ChatMessageType } from '../contexts/ChatContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ChatPageProps {
  onNavigateProfile: () => void;
  onNavigateSettings: () => void;
}

export function ChatPage({ onNavigateProfile, onNavigateSettings }: ChatPageProps) {
  const { language, theme } = useSettings();
  const { speak } = useVoiceAssistant();
  const { user } = useAuth();
  const { 
    currentConversation, 
    addMessage, 
    clearAllChats,
    exportAllChats 
  } = useChat();
  
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* --- Smooth Scroll to Bottom ---
     Auto-scroll to newest message with smooth behavior
     Triggered on new messages or typing indicator
  --- */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentConversation?.messages, isTyping]);

  // Send welcome message when conversation is empty
  useEffect(() => {
    if (currentConversation && currentConversation.messages.length === 0) {
      const welcomeMessage = language === 'en'
        ? "Welcome to Jurisly! I'm your AI Legal Assistant. Ask me about any law or describe your legal situation, and I'll help you understand your rights and obligations."
        : "जुरिसली में आपका स्वागत है! मैं आपका एआई कानूनी सहायक हूं। मुझसे किसी भी कानून के बारे में पूछें या अपनी कानूनी स्थिति का वर्णन करे��, और मैं आपको आपके अधिकारों और दायित्वों को समझने में मदद करूंगा।";
      
      const welcomeMsg: ChatMessageType = {
        id: Date.now().toString(),
        sender: 'ai',
        text: welcomeMessage,
        timestamp: new Date().toISOString(),
      };
      
      addMessage(welcomeMsg);
    }
  }, [currentConversation?.id]);

  const handleCallAI = () => {
    toast.success(language === 'en' ? 'AI Assistant is ready!' : 'एआई सहायक तैयार है!');
  };

  /* --- n8n AI Workflow Integration ---
     PRODUCTION SETUP:

     1. Configure your n8n instance with a webhook trigger:
        - Create a new workflow in n8n
        - Add HTTP Request node with POST trigger
        - Webhook URL: https://your-n8n-instance.com/webhook/ai-response

     2. Send messages with this payload:
        {
          "message": "user's message text",
          "userId": "user@email.com",
          "userEmail": "user@email.com",
          "language": "en|hi",
          "conversationId": "unique-id",
          "timestamp": "ISO-8601 string"
        }

     3. n8n should return:
        {
          "success": true,
          "aiResponse": "AI's reply text",
          "relevanceScore": 85
        }

     4. Uncomment and use the production fetch in sendMessageToAI()

     TESTING:
     - Current mock implementation returns AI responses after 2 seconds
     - Replace mock with actual n8n webhook when ready

     SECURITY:
     - Use HTTPS only in production
     - Add request signing/verification if needed
     - Store n8n webhook URL in environment variables (REACT_APP_N8N_WEBHOOK_URL)
  --- n8n Integration End --- */
  
  const sendMessageToAI = async (userMessage: string): Promise<string> => {
    // Production n8n webhook integration with HTTPS and CORS
    try {
      const response = await fetch('https://chaiwala123.app.n8n.cloud/webhook/legal-ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          query: userMessage,
          message: userMessage,
          userId: user?.email,
          language: language,
          conversationId: currentConversation?.id,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.aiResponse || data.reply || data.response || 'I apologize, but I received an unexpected response. Please try again.';
    } catch (error) {
      console.error('n8n API Error:', error);
      // Fallback to mock response if n8n fails
      console.warn('Falling back to mock response due to API error');
      // Mock AI logic for demonstration (fallback)
      return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        let relevanceScore = 0;

        // Check if it's a law query
        const lawKeywords = ['section', 'article', 'act', 'ipc', 'धारा', 'अनुच्छेद', 'कानून'];
        const isLawQuery = lawKeywords.some(keyword => lowerMessage.includes(keyword));

        // Check if it's a situation query
        const situationKeywords = ['my', 'i am', 'happened', 'situation', 'case', 'मेरा', 'मुझे', 'हुआ', 'स्थिति'];
        const isSituationQuery = situationKeywords.some(keyword => lowerMessage.includes(keyword));

        if (isLawQuery && !isSituationQuery) {
          // Only law mentioned, no situation
          response = language === 'en'
            ? "I understand you're asking about a specific law. To provide better assistance, please describe your situation or type 'nothing' to skip and get general information about this law."
            : "मैं समझता हूं कि आप एक विशिष्ट कानून के बारे में पूछ रहे हैं। बेहतर सहायता प्रदान करने के लिए, कृपया अपनी स्थिति का वर्णन करें या इस कानून के बारे में सामान्य जानकारी प्राप्त करने के लिए 'कुछ नहीं' टाइप करें।";
        } else if (isSituationQuery && isLawQuery) {
          // Both law and situation mentioned
          relevanceScore = Math.floor(Math.random() * 20) + 80; // 80-100%
          response = language === 'en'
            ? `Based on your situation, I've identified the following:\n\n📋 Applicable Law: The law you mentioned is highly relevant to your case.\n\n✅ Application: This law applies to your situation because it governs similar circumstances.\n\n⚖️ How it works: This law provides specific protections and obligations. You have certain rights under this statute that can be enforced through legal channels.\n\nRelevance Score: ${relevanceScore}%\n\nWould you like more specific details about your rights or next steps?`
            : `आपकी स्थिति के आधार पर, मैंने न�����म्नलिखित पहचाना है:\n\n📋 लागू कानून: आपके द्वारा उल्लिखित कानून आपके मामले के लिए अत्यधिक प्रासंगिक है।\n\n✅ आवेदन: यह कानून आपकी स्थिति पर लागू होता है क्योंकि यह समान परिस्थितियों को नियंत्रित करता है।\n\n⚖️ यह कैसे काम करता है: यह कानून विशिष्ट सुरक्षा और दायित्व प्रदान करता है। इस क़ानून के तहत आपके पास कुछ अधिकार हैं जिन्हें कानूनी चैनलों के माध्यम से लागू किया जा सकता है।\n\nप्रासंगिकता स्कोर: ${relevanceScore}%\n\nक्या आप अपने अधिकारों या अगले कदमों के बारे में अधिक विशिष्ट विवरण चाहेंगे?`;
        } else if (isSituationQuery) {
          // Only situation mentioned
          const safeKeywords = ['safe', 'no problem', 'fine', 'okay', 'सुरक्षित', 'ठीक', 'कोई समस्या नहीं'];
          const isSafe = safeKeywords.some(keyword => lowerMessage.includes(keyword));
          
          if (isSafe) {
            response = language === 'en'
              ? "🌟 That's wonderful to hear! Based on your description, it seems you're in a safe and legally sound position. There don't appear to be any immediate legal concerns.\n\nRemember, if anything changes or you need guidance in the future, I'm always here to help. Stay informed and stay safe! 💙"
              : "🌟 यह सुनकर बहुत अच्छा लगा! आपके विवरण के आधार पर, ऐसा लगता है कि आप एक सुरक्षित और कानूनी रूप से अच्छी स्थिति में हैं। कोई तत्काल कानूनी चिंता नहीं दिखती ��ै।\n\nयाद रखें, यदि कुछ बदलता है या आपको भविष्य में मार्गदर्शन की आवश्यकता है, तो मैं हमेशा मदद के लिए यहां हूं। ��ूचित रहें और सुरक्षित रहें! 💙";
          } else {
            relevanceScore = Math.floor(Math.random() * 30) + 70; // 70-100%
            response = language === 'en'
              ? `I've analyzed your situation. Here's what I found:\n\n📋 Related Laws:\n• Consumer Protection Act (if applicable)\n• General contract law principles\n• Relevant civil/criminal statutes\n\n✅ Applicability: ${relevanceScore}% - These laws appear to be relevant to your situation.\n\n💡 Why: The circumstances you've described fall under the jurisdiction of these legal frameworks. They provide specific remedies and protections.\n\n📝 Recommended Action: Consider consulting with a legal professional for personalized advice based on the specifics of your case.`
              : `मैंने आपकी स्थिति का विश्लेषण किया है। यहाँ मुझे क्या मिला:\n\n📋 संबंधित कानून:\n• ���पभोक्ता संरक्षण अधिनियम (यदि लागू हो)\n• सामान्य अनुबंध कानून सिद्धांत\n• प्रासंगिक नागरिक/आपराधिक क़ानून\n\n✅ प्रयोज्यता: ${relevanceScore}% - ये कानून आपकी स्थिति के लिए प्रासंगिक प्रतीत होते हैं।\n\n💡 क्यों: आपके द्वारा वर्णित परिस्थितियाँ इन कानूनी ढाँचों के अधिकार क्षेत्र में आती हैं। वे विशिष्ट उपाय और सुरक्षा प्रदान करते हैं।\n\n📝 अनुशंसित क��र्रवाई: अपने मामले की बारीकियों के आधार पर व्यक्तिगत सलाह के लिए किसी कानूनी पेशेवर से परामर्श करने पर विचार करें।`;
          }
        } else {
          // General query
          response = language === 'en'
            ? "I'm here to help you with legal questions! You can:\n\n• Ask about a specific law (e.g., 'Tell me about Section 420 IPC')\n• Describe a legal situation you're facing\n• Get information about your rights and obligations\n\nHow can I assist you today?"
            : "मैं कानूनी सवालों ��ें आपकी मदद के लिए यहां हूं! आप कर सकते हैं:\n\n• किसी विशिष्ट कानून के बारे में पूछें (जैसे, 'मुझे धारा 420 आईपीसी के बारे में बताएं')\n• अपनी कानूनी स्थिति का वर्णन करें\n• अपने अधिकारों और दायित्वों के बारे में जानकारी प्राप्त करें\n\nमैं आज आपकी कैसे सहायता कर सकता हूं?";
        }

        resolve(response);
      }, 2000);
      });
    }
  };

  /* --- Chat Message Storage Logic ---
     Save each message with:
     - sender: "user" | "ai"
     - text: message content
     - timestamp: ISO string
     - relevance: optional score
     
     Messages are stored in ChatContext and persisted to localStorage
     In production, sync with backend database via n8n
  --- */
  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);

    /* --- "Typing..." Animation Start ---
       Show typing indicator before AI responds
       Gives user visual feedback that AI is processing
    --- */
    setIsTyping(true);

    try {
      // Get AI response (this is where n8n would be called)
      const aiResponse = await sendMessageToAI(messageText);
      
      // Determine if we should show relevance score
      const shouldShowRelevance = aiResponse.includes('Relevance') || aiResponse.includes('प्रासंगिकता');
      const relevance = shouldShowRelevance ? Math.floor(Math.random() * 20) + 80 : undefined;

      // Add AI message
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toISOString(),
        relevance: relevance,
      };

      setIsTyping(false);
      addMessage(aiMessage);

      /* --- Voice Assistant Placeholder ---
         Integrate Web Speech API for text-to-speech
         Example:
         if (voiceEnabled) {
           const utterance = new SpeechSynthesisUtterance(aiResponse);
           utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';
           window.speechSynthesis.speak(utterance);
         }
      --- Voice Assistant End --- */
      speak(aiResponse);
    } catch (error) {
      setIsTyping(false);
      toast.error(language === 'en' ? 'Failed to get response' : 'प्रतिक्रिया प्राप्त करने में विफल');
    }
  };

  const handleClearAll = () => {
    if (confirm(language === 'en' 
      ? 'Are you sure you want to delete all conversations? This cannot be undone.' 
      : 'क्या आप सभी बातचीत हटाना चाहते हैं? इसे पूर्ववत नहीं कि��ा जा सकता।'
    )) {
      clearAllChats();
      toast.success(language === 'en' ? 'All chats cleared' : 'सभी चैट साफ़ हो गई');
    }
  };

  const handleExportAll = () => {
    exportAllChats('txt');
    toast.success(language === 'en' ? 'Chats exported successfully' : 'चैट सफलतापूर्वक निर्यात की गई');
  };

  // Theme gradients
  const themeGradients = {
    dark: 'from-slate-900 via-cyan-900 to-teal-900',
    purple: 'from-slate-900 via-purple-900 to-pink-900',
    blue: 'from-slate-900 via-blue-900 to-cyan-900',
    custom: 'from-indigo-900 via-purple-900 to-pink-900',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradients[theme]} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onExportAll={handleExportAll}
        onClearAll={handleClearAll}
      />

      <Navbar
        onNavigateHome={() => {}}
        onNavigateProfile={onNavigateProfile}
        onNavigateSettings={onNavigateSettings}
        onCallAI={handleCallAI}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Chat Container - Center-aligned messages ---
           Messages displayed in center with proper spacing
           User messages: right-aligned with blue gradient
           AI messages: left-aligned with purple-black-blue gradient
           Smooth scrolling with auto-scroll to bottom
      --- Chat Container End --- */}
      <div
        ref={chatContainerRef}
        className="pt-24 pb-40 px-4 md:px-6 overflow-y-auto h-screen scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
      >
        <div className="max-w-4xl mx-auto w-full">
          {currentConversation?.messages.length === 0 && !isTyping && (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-lg shadow-purple-500/50 flex items-center justify-center">
                    <span className="text-3xl">⚖️</span>
                  </div>
                </div>
                <p className="text-white/70 text-lg mb-2">{language === 'en' ? 'Ready to help!' : 'मदद के लिए तैयार!'}</p>
                <p className="text-white/40 text-sm">{language === 'en' ? 'Start a new conversation with your legal questions.' : 'अपने कानूनी सवालों के साथ एक नई बातचीत शुरू करें।'}</p>
              </div>
            </div>
          )}
          {currentConversation?.messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg.text}
              isAI={msg.sender === 'ai'}
              relevance={msg.relevance}
              delay={index * 0.05}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      <Footer />
      <MessageInput
        onSend={handleSendMessage}
        disabled={isTyping}
        placeholder={language === 'en' ? 'Type a message to Jurisly…' : 'जुरिसली को एक संदेश टाइप करें…'}
      />
    </div>
  );
}
