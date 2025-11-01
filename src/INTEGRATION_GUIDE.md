# Jurisly AI Chat System - Integration Guide

This document provides comprehensive instructions for integrating all features of the Jurisly AI Chat system with backend services and external APIs.

## Table of Contents

1. [Chat Storage System](#chat-storage-system)
2. [n8n AI Workflow Integration](#n8n-ai-workflow-integration)
3. [Voice Assistant Integration](#voice-assistant-integration)
4. [User Authentication](#user-authentication)
5. [Settings and Preferences](#settings-and-preferences)
6. [Export Functionality](#export-functionality)

---

## Chat Storage System

### Current Implementation
- **Location:** `src/contexts/ChatContext.tsx`
- **Storage Method:** localStorage (client-side)
- **Storage Key Format:** `jurisly_chats_<userEmail>`

### Data Structure

Each conversation is stored as:
```typescript
interface Conversation {
  id: string;                              // Unique conversation ID (timestamp)
  userId: string;                          // User email address
  title: string;                           // First user message or "New Chat"
  messages: ChatMessage[];                 // Array of messages
  createdAt: string;                       // ISO 8601 timestamp
  updatedAt: string;                       // ISO 8601 timestamp
}

interface ChatMessage {
  id: string;                              // Unique message ID
  sender: 'user' | 'ai';                   // Message sender type
  text: string;                            // Message content
  timestamp: string;                       // ISO 8601 timestamp
  relevance?: number;                      // Optional relevance score (0-100)
}
```

### Production Migration

To migrate from localStorage to a database:

1. **Backend Setup:**
   ```javascript
   // Example API endpoints needed:
   POST   /api/conversations           // Create new conversation
   GET    /api/conversations           // List user conversations
   GET    /api/conversations/:id       // Get specific conversation
   POST   /api/conversations/:id/messages  // Add message
   DELETE /api/conversations/:id       // Delete conversation
   ```

2. **Update ChatContext:**
   ```typescript
   // Replace localStorage operations with API calls
   useEffect(() => {
     if (user?.email) {
       // Instead of:
       // const savedChats = localStorage.getItem(storageKey);
       
       // Use:
       fetch(`/api/conversations?userId=${user.email}`)
         .then(res => res.json())
         .then(data => setConversations(data));
     }
   }, [user?.email]);
   ```

3. **Sync Changes:**
   - Keep localStorage as cache for offline support
   - Sync with backend on every message addition
   - Handle conflict resolution for multi-device access

---

## n8n AI Workflow Integration

### Current Implementation
- **Location:** `src/components/ChatPage.tsx` (sendMessageToAI function)
- **Current State:** Mock implementation (returns dummy responses)
- **Method:** HTTP POST to n8n webhook

### Setup Instructions

#### Step 1: Create n8n Workflow

1. Open your n8n instance (https://your-n8n-instance.com)
2. Create a new workflow named "Jurisly AI Response"
3. Add a webhook trigger node:
   - Method: POST
   - Authentication: None (or add API key if needed)
   - Copy the webhook URL

#### Step 2: Build n8n Workflow

Example workflow structure:
```
Webhook Trigger
    ↓
Code Node (Process message)
    ↓
OpenAI Node (or other LLM)
    ↓
Response Formatter
    ↓
Return Response
```

#### Step 3: Configure in React

1. **Add environment variable:**
   ```env
   REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-response
   ```

2. **Update sendMessageToAI() in ChatPage.tsx:**
   ```typescript
   const sendMessageToAI = async (userMessage: string): Promise<string> => {
     try {
       const response = await fetch(
         process.env.REACT_APP_N8N_WEBHOOK_URL || '',
         {
           method: 'POST',
           headers: { 
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ 
             message: userMessage,
             userId: user?.email,
             language: language,
             conversationId: currentConversation?.id,
             timestamp: new Date().toISOString(),
             context: {
               userMessage,
               conversationHistory: currentConversation?.messages || []
             }
           })
         }
       );
       
       if (!response.ok) throw new Error('API Error');
       
       const data = await response.json();
       return data.aiResponse || data.reply || data.response;
     } catch (error) {
       console.error('n8n API Error:', error);
       throw new Error('Failed to get AI response');
     }
   };
   ```

#### Step 4: n8n Workflow Example

```n8n
1. Webhook Node (receives POST request)
   └─ Body contains: { message, userId, language, conversationId }

2. Code Node (Optional - validate input)
   └─ Validate message content
   └─ Check language preference

3. OpenAI Node (or Claude, Gemini, etc.)
   └─ Input: userMessage
   └─ Model: gpt-4 (or preferred model)
   └─ System Prompt: "You are Jurisly, an AI legal assistant..."
   └─ Response handling

4. Code Node (Format response)
   └─ Extract AI response
   └─ Calculate relevance score
   └─ Return JSON

5. Return (HTTP Response)
   └─ Status: 200
   └─ Body: { 
       success: true, 
       aiResponse: "response text",
       relevanceScore: 85,
       timestamp: "ISO-string"
     }
```

### Testing the Integration

```javascript
// Test with curl
curl -X POST https://your-n8n-instance.com/webhook/ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is IPC Section 420?",
    "userId": "user@example.com",
    "language": "en",
    "conversationId": "123456",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

---

## Voice Assistant Integration

### Current Implementation
- **Location:** `src/hooks/useVoiceAssistant.tsx`
- **Technology:** Web Speech API (browser native)
- **Supported Languages:** English (en-US), Hindi (hi-IN)

### Speech-to-Text (Voice Input)

```typescript
// Usage in components
const { isListening, startListening, stopListening } = useVoiceAssistant();

// Start listening to user's voice
startListening((transcript) => {
  // transcript contains recognized text
  setUserMessage(transcript);
});

// Stop listening
stopListening();
```

### Text-to-Speech (Voice Output)

```typescript
// Automatically speaks AI responses if enabled
const { speak } = useVoiceAssistant();

speak("This is the AI's response"); // Plays audio response
```

### Web Speech API Limitations

- **Browser Support:** Chrome, Edge, Safari (not Firefox)
- **HTTPS Required:** Microphone access requires HTTPS in production
- **Offline:** Requires internet connection
- **Accuracy:** Varies by device and microphone quality

### Production Enhancement

To improve voice quality, integrate a cloud speech service:

#### Option 1: Google Cloud Speech-to-Text

```typescript
// Replace Web Speech API with Google Cloud
const startListeningGoogle = async (onResult) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  // ... setup
};
```

#### Option 2: Azure Speech Services

```typescript
// Using Azure Cognitive Services
import * as cognitiveservices from "microsoft-cognitiveservices-speech-sdk";

const speechConfig = cognitiveservices.SpeechConfig.fromSubscription(
  "YOUR_SPEECH_KEY", 
  "YOUR_REGION"
);
const recognizer = new cognitiveservices.SpeechRecognizer(speechConfig);
```

#### Option 3: Deepgram

```typescript
// Using Deepgram for superior speech recognition
const deepgramClient = new Deepgram(process.env.REACT_APP_DEEPGRAM_KEY);

const result = await deepgramClient.listen.prerecorded(
  { stream: audioData },
  { model: "nova-2", language: "en" }
);
```

---

## User Authentication

### Current Implementation
- **Location:** `src/contexts/AuthContext.tsx`
- **Current Method:** localStorage (demo only)
- **Security Note:** Passwords stored in localStorage are NOT secure

### Data Structure

```typescript
interface User {
  email: string;           // User's email
  name: string;            // User's full name
  avatar?: string;         // Avatar ID from predefined set
  dateOfBirth?: string;    // User's date of birth
  accountType?: string;    // Type of account
}
```

### Production Authentication

#### Option 1: Firebase Authentication

```typescript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  setUser({ email: userCredential.user.email, name: userCredential.user.displayName });
};
```

#### Option 2: Supabase Authentication

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY);

const login = async (email: string, password: string) => {
  const { user, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  setUser({ email: user.email, name: user.user_metadata?.name });
};
```

#### Option 3: Custom Backend

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    setUser(data.user);
  }
};
```

---

## Settings and Preferences

### Current Implementation
- **Location:** `src/contexts/SettingsContext.tsx`
- **Storage:** localStorage (`jurisly_settings`)
- **Settings Available:**
  - Language (English/Hindi)
  - Voice enabled/disabled
  - AI mode (text/voice-text)
  - Theme (dark/purple/blue/custom)
  - Notification tone

### Production Sync

```typescript
// Save settings to backend
const saveSettings = async (settings: any) => {
  const response = await fetch(`/api/users/${user.id}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  const data = await response.json();
  localStorage.setItem('jurisly_settings', JSON.stringify(data));
};
```

---

## Export Functionality

### Current Implementation

#### Text Export
- **Method:** Direct blob download
- **Format:** Plain text with formatted structure
- **File Pattern:** `jurisly-chat-[timestamp].txt`

#### PDF Export
- **Method:** HTML-based PDF with print dialog
- **Current:** Opens print dialog for user to save as PDF
- **Future:** Can use jsPDF or html2pdf library for automated PDF generation

### Enhancement: Using jsPDF

```typescript
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generatePDF = async (conversationId: string) => {
  const element = document.getElementById(`chat-${conversationId}`);
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF();
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`jurisly-chat-${conversationId}.pdf`);
};
```

### Storage of Exports

For production, consider storing exports in cloud storage:

```typescript
// Example with AWS S3
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

const uploadExport = async (content: string, filename: string) => {
  const params = {
    Bucket: 'jurisly-exports',
    Key: `${user.id}/${filename}`,
    Body: content,
    ContentType: 'text/plain',
    ServerSideEncryption: 'AES256'
  };
  
  return s3.upload(params).promise();
};
```

---

## Mobile Responsive Design

### Current Implementation
- **Responsive Breakpoints:** Tailwind CSS defaults
- **Mobile-First Approach:** Yes
- **Key Mobile Features:**
  - Hamburger menu toggle
  - Reduced message bubble width (85% on mobile, 75% on desktop)
  - Touch-friendly button sizes
  - Optimized input field for mobile keyboards

### Mobile-Specific Considerations

```typescript
// Detect if mobile/tablet
const isMobile = window.innerWidth < 768;

// Handle touch events
const handleTouchStart = (e: TouchEvent) => {
  // Touch-specific handling
};

// Responsive classes in Tailwind
<div className="hidden md:flex">     {/* Desktop only */}
<div className="block md:hidden">    {/* Mobile only */}
<div className="px-4 md:px-6">       {/* Responsive padding */}
```

---

## Security Considerations

### Current Vulnerabilities (Demo Only)

⚠️ **IMPORTANT:** The following are NOT secure for production:

1. **localStorage for passwords** - Use secure HTTP-only cookies instead
2. **No authentication tokens** - Implement JWT or OAuth
3. **No rate limiting** - Add backend rate limiting
4. **No input validation** - Sanitize all user inputs
5. **Exposed API URLs** - Use environment variables

### Production Security Checklist

- [ ] Use HTTPS only
- [ ] Implement CSRF protection
- [ ] Add rate limiting on API endpoints
- [ ] Sanitize user inputs (XSS prevention)
- [ ] Use secure HTTP-only cookies for auth
- [ ] Implement CORS properly
- [ ] Use environment variables for secrets
- [ ] Add request signing/verification
- [ ] Implement refresh token rotation
- [ ] Add logging and monitoring

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] Replace mock AI responses with n8n integration
- [ ] Implement proper authentication (not localStorage)
- [ ] Set up database for chat storage
- [ ] Configure environment variables
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups
- [ ] Add API rate limiting
- [ ] Implement analytics
- [ ] Add logging system

---

## Support and Debugging

### Common Issues

1. **Voice input not working:**
   - Check browser compatibility (Chrome/Edge/Safari)
   - Verify HTTPS in production
   - Check microphone permissions
   - Review console for errors

2. **n8n webhook not responding:**
   - Verify webhook URL is correct
   - Check network tab in browser dev tools
   - Ensure n8n workflow is active
   - Check n8n execution logs

3. **Chat history not persisting:**
   - Check localStorage quota (usually 5-10MB)
   - Verify user is logged in
   - Check browser console for errors
   - Ensure email is set in user context

### Debug Mode

Enable detailed logging:
```typescript
// In ChatPage.tsx or relevant component
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Message sent:', { text, userId, timestamp });
  console.log('n8n Response:', response);
  console.log('Chat history:', conversations);
}
```

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OpenAI API](https://platform.openai.com/docs)
- [jsPDF Documentation](https://github.com/parallax/jspdf)

---

## Version History

- **v1.0.0** (Current)
  - Initial implementation with localStorage
  - Mock AI responses
  - Web Speech API for voice
  - Text and HTML-based PDF export
  - English and Hindi support

---

For questions or issues, refer to the inline code comments in:
- `src/contexts/ChatContext.tsx`
- `src/components/ChatPage.tsx`
- `src/hooks/useVoiceAssistant.tsx`
- `src/contexts/AuthContext.tsx`
