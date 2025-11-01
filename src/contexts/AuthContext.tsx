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

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && 
         import.meta.env.VITE_SUPABASE_ANON_KEY &&
         import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
         import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const useSupabase = isSupabaseConfigured();

  // Check for existing session and listen for auth changes
  useEffect(() => {
    if (useSupabase) {
      // Supabase mode
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
    } else {
      // LocalStorage fallback mode
      const savedUser = localStorage.getItem('jurisly_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, [useSupabase]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (useSupabase) {
        // Supabase mode
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error.message);
          
          if (error.message.includes('Email not confirmed')) {
            return { success: false, message: 'Please verify your email before logging in. Check your inbox for the verification link.' };
          }
          
          return { success: false, message: error.message };
        }

        if (data.user) {
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
      } else {
        // LocalStorage fallback mode
        const users = JSON.parse(localStorage.getItem('jurisly_users') || '[]');
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (foundUser) {
          const userData = {
            email: foundUser.email,
            name: foundUser.name,
            avatar: foundUser.avatar,
            dateOfBirth: foundUser.dateOfBirth,
            accountType: foundUser.accountType,
            emailVerified: true,
          };
          setUser(userData);
          localStorage.setItem('jurisly_user', JSON.stringify(userData));
          return { success: true };
        }
        
        return { success: false, message: 'Invalid email or password.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (useSupabase) {
        // Supabase mode
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
          return { 
            success: true, 
            message: 'Account created! Please check your email to verify your account before logging in.' 
          };
        }

        return { success: false, message: 'Signup failed. Please try again.' };
      } else {
        // LocalStorage fallback mode
        const users = JSON.parse(localStorage.getItem('jurisly_users') || '[]');
        
        if (users.find((u: any) => u.email === email)) {
          return { success: false, message: 'An account with this email already exists.' };
        }
        
        const newUser = {
          email,
          password,
          name,
          emailVerified: true,
        };
        
        users.push(newUser);
        localStorage.setItem('jurisly_users', JSON.stringify(users));
        
        const userData = {
          email,
          name,
          emailVerified: true,
        };
        setUser(userData);
        localStorage.setItem('jurisly_user', JSON.stringify(userData));
        
        return { success: true, message: 'Account created successfully!' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (useSupabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error.message);
        }
      } else {
        localStorage.removeItem('jurisly_user');
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      if (useSupabase) {
        const { error } = await supabase.auth.updateUser({
          data: updates,
        });

        if (error) {
          console.error('Profile update error:', error.message);
          return false;
        }
      } else {
        // LocalStorage fallback mode
        const users = JSON.parse(localStorage.getItem('jurisly_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === user.email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('jurisly_users', JSON.stringify(users));
        }
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('jurisly_user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      if (useSupabase) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (verifyError) {
          console.error('Current password verification failed:', verifyError.message);
          return false;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          console.error('Password update error:', updateError.message);
          return false;
        }

        return true;
      } else {
        // LocalStorage fallback mode
        const users = JSON.parse(localStorage.getItem('jurisly_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === user.email && u.password === currentPassword);
        
        if (userIndex === -1) {
          return false;
        }
        
        users[userIndex].password = newPassword;
        localStorage.setItem('jurisly_users', JSON.stringify(users));
        return true;
      }
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (useSupabase) {
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
      } else {
        // LocalStorage fallback mode - just return success message
        return { 
          success: true, 
          message: 'Password reset not available in demo mode. Please use "Update Password" in settings if logged in.' 
        };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const updatePasswordWithToken = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (useSupabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error('Password update error:', error.message);
          return { success: false, message: error.message };
        }

        return { success: true, message: 'Password updated successfully!' };
      } else {
        return { success: false, message: 'This feature requires Supabase configuration.' };
      }
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      if (useSupabase) {
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
      } else {
        return { success: true, message: 'Email verification not required in demo mode.' };
      }
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
