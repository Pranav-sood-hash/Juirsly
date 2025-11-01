import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ChatProvider } from './contexts/ChatContext';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ChatPage } from './components/ChatPage';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { ResetPassword } from './components/ResetPassword';
import { EmailVerification } from './components/EmailVerification';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';

type Page = 'login' | 'signup' | 'chat' | 'reset-password' | 'verify-email';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Check for auth-related URL hash parameters (Supabase uses hash fragments)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    // Handle email verification
    if (type === 'signup') {
      setCurrentPage('verify-email');
      return;
    }
    
    // Handle password reset
    if (type === 'recovery') {
      setCurrentPage('reset-password');
      return;
    }
  }, []);

  // If not authenticated, show login/signup/reset password/verify email
  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'verify-email' ? (
          <EmailVerification onVerified={() => setCurrentPage('login')} />
        ) : currentPage === 'reset-password' ? (
          <ResetPassword onSuccess={() => setCurrentPage('login')} />
        ) : currentPage === 'login' ? (
          <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setCurrentPage('login')} />
        )}
      </>
    );
  }

  // If authenticated, show chat page
  return (
    <>
      <ChatPage
        onNavigateProfile={() => setShowProfile(true)}
        onNavigateSettings={() => setShowSettings(true)}
      />

      {/* Modals */}
      <AnimatePresence>
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </>
  );
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
