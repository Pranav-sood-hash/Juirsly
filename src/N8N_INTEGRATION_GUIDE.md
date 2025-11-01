# Jurisly - n8n Integration Guide

## Overview
This guide explains how to integrate your n8n AI workflow with the Jurisly AI Legal Assistant application.

## Where to Connect n8n

The main integration point is in `/components/ChatPage.tsx` in the `sendMessageToAI` function (around line 90).

### Current Mock Implementation
```javascript
const sendMessageToAI = async (userMessage: string): Promise<string> => {
  // TODO: Replace this mock function with actual n8n API call
  // ... mock logic ...
}
```

### Production Implementation

Replace the mock function with this n8n integration:

```javascript
const sendMessageToAI = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add authentication if needed
        // 'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({ 
        message: userMessage,
        language: language, // 'en' or 'hi'
        userId: user?.email, // Optional: track user conversations
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    
    // Expecting response format:
    // {
    //   reply: "AI response text",
    //   relevance: 85 (optional),
    //   metadata: {} (optional)
    // }
    
    return data.reply || data.aiResponse || data.message;
  } catch (error) {
    console.error('n8n API Error:', error);
    throw error;
  }
};
```

## n8n Workflow Setup

### Expected Input to n8n Webhook
```json
{
  "message": "User's legal question or situation",
  "language": "en",
  "userId": "user@example.com",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

### Expected Output from n8n Workflow
```json
{
  "reply": "AI-generated legal response",
  "relevance": 85,
  "metadata": {
    "laws_referenced": ["Section 420 IPC", "Consumer Protection Act"],
    "confidence": 0.92
  }
}
```

## Voice Assistant Integration

The voice features are already integrated! The app uses:
- **Speech-to-Text**: Web Speech API (Chrome, Edge, Safari)
- **Text-to-Speech**: Browser's SpeechSynthesis API

Voice responses are automatically triggered when:
1. Voice settings are enabled (Settings → Voice Settings: ON)
2. AI Mode is set to "Voice + Text" (Settings → AI Mode)

### Microphone Troubleshooting

If users experience microphone issues:
- A help button (?) is available next to the microphone button
- Click it to see detailed permission instructions
- Common error: "not-allowed" = user needs to grant microphone permission
- See `MICROPHONE_TROUBLESHOOTING.md` for complete guide

### Voice Requirements
- HTTPS connection (or localhost for development)
- Supported browsers: Chrome, Edge, Safari
- User must grant microphone permission

## Authentication System

User authentication is currently using localStorage (demo purposes).

### For Production:
Replace the authentication in `/contexts/AuthContext.tsx`:

```javascript
const login = async (email: string, password: string): Promise<boolean> => {
  const response = await fetch('YOUR_BACKEND_API/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return true;
  }
  return false;
};
```

## Settings Persistence

Settings are stored in localStorage. For production, sync with backend:

In `/contexts/SettingsContext.tsx`, add:

```javascript
// Sync settings to backend when changed
useEffect(() => {
  if (isAuthenticated) {
    fetch('YOUR_BACKEND_API/user/settings', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(settings)
    });
  }
}, [language, voiceEnabled, aiMode, theme, notificationTone]);
```

## Chat History Persistence

To save chat history to a database, modify the `handleSendMessage` function:

```javascript
const handleSendMessage = async (messageText: string) => {
  const userMessage = { /* ... */ };
  setMessages((prev) => [...prev, userMessage]);
  
  // Save to backend
  await fetch('YOUR_BACKEND_API/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.email,
      message: userMessage,
      sessionId: currentSessionId
    })
  });
  
  // ... rest of the function
};
```

## Environment Variables

Create a `.env` file in your project root:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-agent
VITE_BACKEND_API_URL=https://your-backend-api.com
VITE_API_KEY=your_api_key_here
```

Access them in your code:
```javascript
const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
```

## Testing the Integration

1. **Test n8n webhook directly** using curl or Postman:
```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about Section 420 IPC",
    "language": "en"
  }'
```

2. **Test in the app**:
   - Login to Jurisly
   - Send a test message
   - Check browser console for any errors
   - Verify the response appears correctly

## Security Considerations

⚠️ **Important**: This application is for demonstration purposes.

For production deployment:
- Never store passwords in plain text (use bcrypt or similar)
- Use secure JWT tokens for authentication
- Implement rate limiting
- Add CORS configuration
- Use HTTPS only
- Validate and sanitize all inputs
- Don't collect or store sensitive PII without proper security measures

## Support

For issues with:
- **n8n Integration**: Check n8n workflow logs
- **Voice Features**: Ensure HTTPS (required for microphone access)
- **Authentication**: Check browser console for errors
- **Settings**: Clear localStorage and retry

## Features Checklist

✅ Login/Signup System
✅ AI Chat Interface with centered messages
✅ Voice Assistant (Speech-to-Text & Text-to-Speech)
✅ Settings Page with customization options
✅ Profile Page
✅ n8n Integration points (ready to connect)
✅ Language Support (English & Hindi)
✅ Theme Customization (4 themes)
✅ Responsive Design
✅ Animated UI with glassmorphism
✅ Navbar with all required links
✅ Footer with copyright

## Next Steps

1. Set up your n8n workflow
2. Update the n8n webhook URL in ChatPage.tsx
3. Test the integration
4. Optionally: Set up backend authentication
5. Optionally: Add database for chat history
6. Deploy your application

Good luck with your Jurisly AI Legal Assistant! 🚀
