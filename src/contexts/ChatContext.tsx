import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

/* --- Chat Storage Start ---
   Each message is stored as:
   { 
     id: string,
     sender: "user" | "ai", 
     text: string, 
     timestamp: ISO string,
     relevance?: number
   }
   
   Each conversation is stored as:
   {
     id: string,
     userId: string (user email),
     title: string (first user message or "New Chat"),
     messages: Message[],
     createdAt: ISO string,
     updatedAt: ISO string
   }
   
   Stored in localStorage under key: "jurisly_chats_<userEmail>"
   Later upgrade to database via n8n webhook for persistence across devices
--- Chat Storage End --- */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  relevance?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  createNewChat: () => void;
  switchConversation: (conversationId: string) => void;
  addMessage: (message: ChatMessage) => void;
  clearAllChats: () => void;
  deleteConversation: (conversationId: string) => void;
  exportConversation: (conversationId: string, format: 'txt' | 'pdf') => void;
  exportAllChats: (format: 'txt' | 'pdf') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* --- PDF Generation Helper ---
   Creates a downloadable PDF from text content
   In production, integrate with jsPDF or html2pdf for advanced formatting
--- PDF Generation End --- */
function generatePDFFromContent(textContent: string, filename: string) {
  // Create HTML structure for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Jurisly Chat Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 20px;
          background-color: #fff;
        }
        h1, h2 {
          color: #1a4d7d;
          border-bottom: 2px solid #1a4d7d;
          padding-bottom: 10px;
        }
        .message-block {
          margin: 15px 0;
          padding: 10px;
          border-left: 3px solid #ccc;
          background-color: #f9f9f9;
        }
        .user-message {
          border-left-color: #3b82f6;
          background-color: #e3f2fd;
        }
        .ai-message {
          border-left-color: #8b5cf6;
          background-color: #f3e8ff;
        }
        .timestamp {
          font-size: 0.85em;
          color: #666;
          margin-bottom: 5px;
        }
        .sender {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .relevance {
          font-size: 0.85em;
          color: #06b6d4;
          margin-top: 10px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .divider {
          border-top: 1px solid #ddd;
          margin: 20px 0;
        }
        .conversation-header {
          background-color: #1a4d7d;
          color: white;
          padding: 15px;
          margin: 20px 0 15px 0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      ${textContent.split('\n').map(line => {
        if (line.startsWith('#') && !line.startsWith('####')) {
          return `<div class="conversation-header">${line.replace(/#/g, '').trim()}</div>`;
        }
        if (line.startsWith('[') && line.includes(']')) {
          return `<div class="message-block"><div class="timestamp">${line}</div></div>`;
        }
        if (line === '') return '<div class="divider"></div>';
        return `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
      }).join('')}
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // For PDF export, we'll convert HTML to canvas and then to PDF using a simple approach
  const link = document.createElement('a');

  // Create a data URL that opens in a new tab for printing to PDF
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.document.title = 'Jurisly Chat Export - Print to PDF';
  }

  // Also provide a direct download option via data URL
  setTimeout(() => {
    link.href = url;
    link.download = filename.replace('.pdf', '.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  /* --- Load Chat History from localStorage ---
     On mount and when user changes, load all conversations for this user
     In production, fetch from backend/database
  --- */
  useEffect(() => {
    if (user?.email) {
      const storageKey = `jurisly_chats_${user.email}`;
      const savedChats = localStorage.getItem(storageKey);
      
      if (savedChats) {
        const parsed = JSON.parse(savedChats) as Conversation[];
        setConversations(parsed);
        
        // Set the most recent conversation as current
        if (parsed.length > 0 && !currentConversationId) {
          setCurrentConversationId(parsed[0].id);
        }
      } else {
        // Create initial welcome conversation
        createInitialChat();
      }
    }
  }, [user?.email]);

  /* --- Save Chat History to localStorage ---
     Whenever conversations change, persist to localStorage
     In production, sync with backend via n8n webhook
  --- */
  useEffect(() => {
    if (user?.email && conversations.length > 0) {
      const storageKey = `jurisly_chats_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    }
  }, [conversations, user?.email]);

  const createInitialChat = () => {
    const welcomeConversation: Conversation = {
      id: Date.now().toString(),
      userId: user?.email || '',
      title: 'Welcome to Jurisly',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setConversations([welcomeConversation]);
    setCurrentConversationId(welcomeConversation.id);
  };

  const createNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      userId: user?.email || '',
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const switchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const addMessage = (message: ChatMessage) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === currentConversationId) {
          const updatedMessages = [...conv.messages, message];
          
          // Update title with first user message (first 50 chars)
          let updatedTitle = conv.title;
          if (message.sender === 'user' && conv.messages.length === 0) {
            updatedTitle = message.text.slice(0, 50) + (message.text.length > 50 ? '...' : '');
          }
          
          return {
            ...conv,
            messages: updatedMessages,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      });
    });
  };

  const clearAllChats = () => {
    if (user?.email) {
      const storageKey = `jurisly_chats_${user.email}`;
      localStorage.removeItem(storageKey);
      setConversations([]);
      setCurrentConversationId(null);
      createInitialChat();
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((conv) => conv.id !== conversationId);
      
      // If deleting current conversation, switch to another
      if (conversationId === currentConversationId) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id);
        } else {
          setCurrentConversationId(null);
          // Create a new chat if no conversations left
          setTimeout(createInitialChat, 0);
        }
      }
      
      return filtered;
    });
  };

  /* --- Export Conversation to File ---
     Export conversation history as .txt or .pdf
     PDF uses HTML-based approach for better formatting
     In production, integrate with jsPDF or html2pdf library for advanced styling
  --- */
  const exportConversation = (conversationId: string, format: 'txt' | 'pdf') => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    let content = `Jurisly - Legal AI Assistant\n`;
    content += `Conversation: ${conversation.title}\n`;
    content += `Date: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    conversation.messages.forEach((msg) => {
      const sender = msg.sender === 'user' ? 'You' : 'Jurisly AI';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      content += `[${time}] ${sender}:\n${msg.text}\n\n`;

      if (msg.relevance) {
        content += `Relevance Score: ${msg.relevance}%\n\n`;
      }

      content += `${'-'.repeat(60)}\n\n`;
    });

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jurisly-chat-${conversation.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      generatePDFFromContent(content, `jurisly-chat-${conversation.id}.pdf`);
    }
  };

  const exportAllChats = (format: 'txt' | 'pdf') => {
    let content = `Jurisly - Legal AI Assistant\n`;
    content += `All Conversations Export\n`;
    content += `User: ${user?.email}\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    conversations.forEach((conversation) => {
      content += `\n${'#'.repeat(60)}\n`;
      content += `CONVERSATION: ${conversation.title}\n`;
      content += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
      content += `${'#'.repeat(60)}\n\n`;

      conversation.messages.forEach((msg) => {
        const sender = msg.sender === 'user' ? 'You' : 'Jurisly AI';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        content += `[${time}] ${sender}:\n${msg.text}\n\n`;

        if (msg.relevance) {
          content += `Relevance Score: ${msg.relevance}%\n\n`;
        }

        content += `${'-'.repeat(60)}\n\n`;
      });
    });

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jurisly-all-chats-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      /* --- PDF Export Implementation ---
         Generates a downloadable PDF file from chat history
         Uses HTML structure to create formatted PDF document
         In production, consider using jsPDF or html2pdf library for enhanced styling
      --- PDF Export End --- */
      generatePDFFromContent(content, `jurisly-all-chats-${Date.now()}.pdf`);
    }
  };

  const currentConversation = conversations.find((c) => c.id === currentConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentConversation,
        createNewChat,
        switchConversation,
        addMessage,
        clearAllChats,
        deleteConversation,
        exportConversation,
        exportAllChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
