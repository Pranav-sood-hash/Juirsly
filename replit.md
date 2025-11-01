# AI Legal Assistant Website

## Overview
AI Legal Assistant is a React-based web application designed to provide legal assistance through an AI-powered chat interface. The application features a modern, responsive UI built with React, TypeScript, Vite, and Tailwind CSS.

**Current State**: The project is successfully running in the Replit environment with all dependencies installed and the development server configured on port 5000.

## Recent Changes
*Last updated: November 1, 2025*

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
- **Authentication System**: Login, signup, password reset (currently using localStorage)
- **Chat Interface**: AI-powered legal assistant with conversation history
- **Voice Assistant**: Microphone integration for voice queries
- **Multi-language Support**: English and Hindi
- **Dark/Light Theme**: Theme switching with next-themes
- **Settings Management**: User preferences and configuration
- **Profile Management**: User profile viewing and editing

### Data Storage
Currently uses **localStorage** for:
- User authentication data
- Chat conversation history
- User settings and preferences

**Production Consideration**: The codebase includes placeholders for integrating with backend APIs for proper data persistence.

### External Integrations (Planned)
- **n8n Webhook**: For AI response generation (see N8N_INTEGRATION_GUIDE.md)
- **Backend API**: For authentication, data persistence, and user management

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

### Environment Variables (Optional)
The application supports the following environment variables:
- `VITE_N8N_WEBHOOK_URL`: n8n webhook endpoint for AI responses
- `VITE_BACKEND_API_URL`: Backend API URL for production
- `VITE_API_KEY`: API key for external services

## Documentation Files
- `IMPLEMENTATION_SUMMARY.md`: Feature implementation details
- `INTEGRATION_GUIDE.md`: General integration guidelines
- `N8N_INTEGRATION_GUIDE.md`: n8n webhook setup instructions
- `VOICE_FEATURE_GUIDE.md`: Voice assistant feature documentation
- `MICROPHONE_TROUBLESHOOTING.md`: Microphone permission help
- `Attributions.md`: Third-party attributions

## User Preferences
*No specific user preferences recorded yet*
