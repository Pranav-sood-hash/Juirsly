import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth?: string;
  accountType?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePasswordWithToken: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session and listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.user_metadata?.avatar,
          dateOfBirth: session.user.user_metadata?.dateOfBirth,
          accountType: session.user.user_metadata?.accountType,
          emailVerified: !!session.user.email_confirmed_at,
        });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.user_metadata?.avatar,
          dateOfBirth: session.user.user_metadata?.dateOfBirth,
          accountType: session.user.user_metadata?.accountType,
          emailVerified: !!session.user.email_confirmed_at,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        
        // Check for specific error types
        if (error.message.includes('Email not confirmed')) {
          return { success: false, message: 'Please verify your email before logging in. Check your inbox for the verification link.' };
        }
        
        return { success: false, message: error.message };
      }

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          return { success: false, message: 'Please verify your email before logging in. Check your inbox for the verification link.' };
        }

        setUser({
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          avatar: data.user.user_metadata?.avatar,
          dateOfBirth: data.user.user_metadata?.dateOfBirth,
          accountType: data.user.user_metadata?.accountType,
          emailVerified: !!data.user.email_confirmed_at,
        });
        return { success: true };
      }

      return { success: false, message: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        return { success: false, message: error.message };
      }

      if (data.user) {
        // Note: User is created but not authenticated until email is verified
        // Don't set user state here - they need to verify email first
        return { 
          success: true, 
          message: 'Account created! Please check your email to verify your account before logging in.' 
        };
      }

      return { success: false, message: 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        console.error('Profile update error:', error.message);
        return false;
      }

      setUser({ ...user, ...updates });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        console.error('Current password verification failed:', verifyError.message);
        return false;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error.message);
        return { success: false, message: error.message };
      }

      return { 
        success: true, 
        message: 'Password reset email sent! Check your inbox for the reset link.' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const updatePasswordWithToken = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error.message);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        return { success: false, message: 'No user session found.' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        console.error('Resend verification error:', error.message);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Verification email sent! Check your inbox.' };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateUserProfile,
        updatePassword,
        resetPassword,
        updatePasswordWithToken,
        resendVerificationEmail,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
