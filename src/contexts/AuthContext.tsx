import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth?: string;
  accountType?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        setUser({
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          avatar: data.user.user_metadata?.avatar,
          dateOfBirth: data.user.user_metadata?.dateOfBirth,
          accountType: data.user.user_metadata?.accountType,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }

      if (data.user) {
        setUser({
          email: data.user.email || '',
          name: name,
          avatar: data.user.user_metadata?.avatar,
          dateOfBirth: data.user.user_metadata?.dateOfBirth,
          accountType: data.user.user_metadata?.accountType,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
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

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        console.error('Profile update error:', error.message);
        return;
      }

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Profile update error:', error);
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
