# AI Legal Assistant Website

## Overview
AI Legal Assistant is a React-based web application designed to provide legal assistance through an AI-powered chat interface. The application features a modern, responsive UI built with React, TypeScript, Vite, and Tailwind CSS.

**Current State**: The project is successfully running in the Replit environment with all dependencies installed and the development server configured on port 5000.

## Recent Changes
*Last updated: November 1, 2025*

### Fixed "Failed to Fetch" Errors (November 1, 2025)
- **Resolved authentication errors** caused by missing Supabase credentials
- **Added localStorage fallback** for authentication when Supabase is not configured
- **Dual-mode authentication system**:
  - When Supabase credentials are configured: Uses Supabase Auth
  - When Supabase credentials are missing: Uses localStorage (demo mode)
- **All auth features work in both modes**: login, signup, logout, profile updates, password management
- **No more "Failed to fetch" errors** on login/signup attempts
- **Smooth user experience** with automatic detection and mode switching
- **Note**: localStorage mode is for development/demo only. Use Supabase for production.

### n8n Webhook Integration (November 1, 2025)
- **Implemented production n8n webhook** for AI responses in `src/components/ChatPage.tsx`
- **Webhook URL**: https://chaiwala123.app.n8n.cloud/webhook/legal-ai
- **HTTPS and CORS Configuration**:
  - All API calls use HTTPS (no HTTP endpoints)
  - Proper CORS configuration with `mode: 'cors'` in fetch requests
  - Content-Type set to `application/json`
- **Request Payload**: Includes query, message, userId, language, conversationId, and timestamp
- **Response Handling**: Checks multiple response fields (aiResponse, reply, response) for flexibility
- **Error Handling**: Graceful fallback to mock responses if n8n webhook is unavailable
- **Status**: Production-ready and tested with dev server running on port 5000

### Supabase Backend Integration (November 1, 2025)
- **Installed @supabase/supabase-js** package for backend integration
- **Created Supabase client** configuration in `src/lib/supabase.ts`
- **Migrated AuthContext** from localStorage to Supabase authentication:
  - Login, signup, and logout now use Supabase Auth API
  - Session management with automatic state synchronization
  - Secure password updates with verification
  - Profile updates stored in Supabase user metadata
- **Updated all auth-related components** to handle async operations:
  - LoginPage, SignupPage, ProfilePage, and Navbar
- **Added TypeScript definitions** for Vite environment variables
- **Configured secure credential management** via Replit Secrets
- All authentication methods include proper error handling and user feedback

### Initial Replit Setup
- Configured Vite to run on port 5000 with proper host settings (0.0.0.0) for Replit proxy compatibility
- **Critical Fix**: Added `allowedHosts: true` to vite.config.ts to allow Replit's dynamic preview URLs
- Added HMR configuration for WebSocket connections through Replit's proxy
- Created TypeScript configuration files (tsconfig.json, tsconfig.node.json)
- Installed missing dependencies: tailwindcss, autoprefixer, postcss, typescript, @tailwindcss/postcss
- Created Tailwind CSS and PostCSS configuration files (upgraded to Tailwind CSS v4)
- Updated .gitignore to include build artifacts and environment files
- Added "type": "module" to package.json for ES module support
- Configured development workflow to run on port 5000 with webview output
- Configured deployment for autoscale with Vite preview mode

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript
- **Backend**: Supabase (Authentication & Database)
- **Styling**: Tailwind CSS with custom theme variables
- **UI Components**: Radix UI primitives + custom components
- **State Management**: React Context (Auth, Settings, Chat)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Notifications**: Sonner

### Project Structure
```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components (buttons, cards, etc.)
│   ├── figma/       # Figma-related components
│   └── ...          # Feature components (Login, Chat, Settings, etc.)
├── contexts/        # React Context providers
│   ├── AuthContext.tsx
│   ├── ChatContext.tsx
│   └── SettingsContext.tsx
├── hooks/           # Custom React hooks
│   └── useVoiceAssistant.tsx
├── styles/          # Global CSS styles
│   └── globals.css
└── guidelines/      # Documentation
```

### Key Features
- **Authentication System**: Login, signup, password reset powered by **Supabase Auth**
- **Chat Interface**: AI-powered legal assistant with conversation history
- **Voice Assistant**: Microphone integration for voice queries
- **Multi-language Support**: English and Hindi
- **Dark/Light Theme**: Theme switching with next-themes
- **Settings Management**: User preferences and configuration
- **Profile Management**: User profile viewing and editing with Supabase storage

### Data Storage
- **User Authentication**: Managed by **Supabase Auth** with secure session handling
- **User Profiles**: Stored in Supabase user metadata (avatar, date of birth, account type)
- **Chat conversation history**: Currently localStorage (migration to Supabase planned)
- **User settings and preferences**: Currently localStorage (migration to Supabase planned)

### External Integrations
- **Supabase**: Backend-as-a-Service for authentication and database (ACTIVE)
  - Project URL: Configured via `VITE_SUPABASE_URL` environment variable
  - Anonymous key: Secured via `VITE_SUPABASE_ANON_KEY` environment variable
  - Client configuration: `src/lib/supabase.ts`
- **n8n Webhook**: For AI response generation (ACTIVE)
  - Webhook URL: https://chaiwala123.app.n8n.cloud/webhook/legal-ai (hardcoded in `src/components/ChatPage.tsx`)
  - HTTPS with proper CORS configuration
  - Graceful fallback to mock responses on failure
  - See N8N_INTEGRATION_GUIDE.md for implementation details

### Development
- **Dev Server**: Runs on port 5000 (configured for Replit)
- **Build Output**: `build/` directory
- **Scripts**: 
  - `npm run dev`: Start development server
  - `npm run build`: Build for production

## Configuration Notes

### Vite Configuration
- Host: 0.0.0.0 (required for Replit)
- Port: 5000 (Replit's standard web preview port)
- **allowedHosts: true** (required for Replit's dynamic preview URLs)
- HMR: Configured for WebSocket connections through Replit proxy
- Build target: ESNext

### Environment Variables
The application requires the following environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL (REQUIRED - stored in Replit Secrets)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key (REQUIRED - stored in Replit Secrets)

**Note**: The n8n webhook URL is hardcoded directly in `src/components/ChatPage.tsx` for production use.

**Important**: Environment variables are managed through Replit Secrets for security. A local `.env` file is auto-generated from secrets for Vite development use.

## Documentation Files
- `IMPLEMENTATION_SUMMARY.md`: Feature implementation details
- `INTEGRATION_GUIDE.md`: General integration guidelines
- `N8N_INTEGRATION_GUIDE.md`: n8n webhook setup instructions
- `VOICE_FEATURE_GUIDE.md`: Voice assistant feature documentation
- `MICROPHONE_TROUBLESHOOTING.md`: Microphone permission help
- `Attributions.md`: Third-party attributions

## User Preferences
*No specific user preferences recorded yet*
