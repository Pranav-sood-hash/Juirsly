# Supabase + React Integration Guide

This guide explains how the React frontend connects to Supabase for authentication, user management, and data storage.

## Table of Contents
1. [Supabase Client Setup](#supabase-client-setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Context](#authentication-context)
4. [Usage in Components](#usage-in-components)
5. [Route Protection](#route-protection)
6. [Database Schema](#database-schema)

---

## 1. Supabase Client Setup

The Supabase client is configured in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Authentication features will not work until configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Key Points:**
- Uses Vite's environment variable system (`import.meta.env`)
- Provides fallback values for development
- Warns if credentials are missing
- Exports a singleton client instance

---

## 2. Environment Variables

### Required Environment Variables

Create a `.env` file in your project root (or use Replit Secrets):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to Get These Values

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `VITE_SUPABASE_ANON_KEY`

### In Replit

The environment variables are stored in **Replit Secrets** and are automatically available to your application. No `.env` file is needed when using Replit.

---

## 3. Authentication Context

The `AuthContext` (located in `src/contexts/AuthContext.tsx`) provides centralized authentication state management.

### Features

- ✅ User session management
- ✅ Login/Signup/Logout
- ✅ Email verification
- ✅ Password reset
- ✅ Profile updates
- ✅ Real-time auth state synchronization

### Available Methods

```typescript
interface AuthContextType {
  user: User | null;                           // Current authenticated user
  isAuthenticated: boolean;                    // Whether user is logged in
  loading: boolean;                            // Loading state during auth checks
  
  // Authentication methods
  login: (email: string, password: string) => Promise<Result>;
  signup: (email: string, password: string, name: string) => Promise<Result>;
  logout: () => Promise<void>;
  
  // User management
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<Result>;
  updatePasswordWithToken: (newPassword: string) => Promise<Result>;
  resendVerificationEmail: () => Promise<Result>;
}
```

### How It Works

1. **Session Initialization**: On app load, checks for existing Supabase session
2. **Auth State Listener**: Subscribes to Supabase auth changes (login, logout, token refresh)
3. **Auto Sync**: Automatically updates user state when auth state changes

---

## 4. Usage in Components

### Example: Login Page

```typescript
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back to Jurisly!');
    } else {
      toast.error(result.message || 'Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example: Signup Page

```typescript
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signup(email, password, name);
    if (result.success) {
      toast.success(result.message || 'Account created! Check your email.');
    } else {
      toast.error(result.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your Name"
      />
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Example: Accessing User Data in Chat

```typescript
import { useAuth } from '../contexts/AuthContext';

export function ChatPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <span>Welcome, {user?.name}!</span>
        <button onClick={logout}>Logout</button>
      </header>
      
      <div className="chat-container">
        {/* Chat interface */}
      </div>
    </div>
  );
}
```

### Example: Profile Updates

```typescript
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');

  const handleSave = async () => {
    const success = await updateUserProfile({ name });
    if (success) {
      toast.success('Profile updated!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
```

---

## 5. Route Protection

Routes are protected at the app level using the `isAuthenticated` flag from the `AuthContext`.

### Implementation in App.tsx

```typescript
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  // If not authenticated, show login/signup pages
  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'login' ? (
          <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setCurrentPage('login')} />
        )}
      </>
    );
  }

  // If authenticated, show the chat application
  return <ChatPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ChatProvider>
          <AppContent />
          <Toaster position="top-center" theme="dark" />
        </ChatProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
```

### How It Works

1. **AuthProvider Wrapper**: Wraps the entire app to provide auth context
2. **Conditional Rendering**: Uses `isAuthenticated` to determine which pages to show
3. **Automatic Redirection**: When user logs in, `isAuthenticated` becomes `true` and they see the chat page
4. **Session Persistence**: Auth state persists across page refreshes via Supabase session

### Loading States

The auth context provides a `loading` state for initial session checks:

```typescript
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Rest of the component...
}
```

---

## 6. Database Schema

### Required Supabase Configuration

#### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended)

#### Email Verification (Optional but Recommended)

1. Go to **Authentication** → **Settings**
2. Enable **Confirm email**
3. Set **Site URL** to your Replit deployment URL

#### Database Tables (Optional)

For chat history and user profiles, you can create additional tables:

**Profiles Table** (`profiles`):
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar TEXT,
  date_of_birth DATE,
  account_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

**Chat History Table** (`chat_history`):
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own chat history
CREATE POLICY "Users can view own chats" 
  ON chat_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" 
  ON chat_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

---

## Common Patterns

### 1. Protected API Calls

```typescript
import { supabase } from '../lib/supabase';

export async function saveChat(message: string, role: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: user.id,
      message,
      role
    });

  if (error) throw error;
  return data;
}
```

### 2. Handling Email Verification

```typescript
// Check if email is verified
const { user } = useAuth();

if (user && !user.emailVerified) {
  return <EmailVerificationPrompt />;
}
```

### 3. Password Reset Flow

```typescript
const { resetPassword } = useAuth();

const handleReset = async (email: string) => {
  const result = await resetPassword(email);
  if (result.success) {
    toast.success('Check your email for reset link!');
  }
};
```

---

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Check that environment variables are set correctly
   - Verify your Supabase URL and anon key
   - Ensure your Supabase project is active

2. **Email verification not working**
   - Check email provider settings in Supabase dashboard
   - Verify Site URL is set correctly
   - Check spam folder for verification emails

3. **Session not persisting**
   - Clear browser cache and cookies
   - Check that third-party cookies are enabled
   - Verify Supabase is using correct storage (localStorage)

4. **CORS errors**
   - Add your deployment domain to Supabase allowed URLs
   - Go to **Authentication** → **URL Configuration**

---

## Security Best Practices

1. ✅ **Never expose service_role key** - Only use anon key in frontend
2. ✅ **Enable Row Level Security (RLS)** on all tables
3. ✅ **Validate user input** before sending to Supabase
4. ✅ **Use email verification** to prevent fake accounts
5. ✅ **Implement rate limiting** for auth endpoints (Supabase provides this)
6. ✅ **Regular security audits** of RLS policies

---

## Next Steps

- Set up chat history persistence with Supabase database
- Implement real-time features using Supabase Realtime
- Add social authentication (Google, GitHub, etc.)
- Configure custom email templates
- Set up database backups

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
