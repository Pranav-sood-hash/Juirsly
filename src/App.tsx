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
import { Toaster } from 'sonner@2.0.3';
import { AnimatePresence } from 'motion/react';

type Page = 'login' | 'signup' | 'chat' | 'reset-password';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check for reset password token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setCurrentPage('reset-password');
    }
  }, []);

  // If not authenticated, show login/signup/reset password
  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'reset-password' && resetToken ? (
          <ResetPassword
            token={resetToken}
            onSuccess={() => setCurrentPage('login')}
          />
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
