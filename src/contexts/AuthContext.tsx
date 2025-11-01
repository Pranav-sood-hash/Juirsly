import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth?: string;
  accountType?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => void;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /* --- Login Auth Check ---
     This checks localStorage for existing user session
     In production, replace with secure JWT token validation
  --- */
  useEffect(() => {
    const storedUser = localStorage.getItem('jurisly_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    /* --- Login Auth Logic ---
       Currently using localStorage for demo purposes
       In production, validate credentials against backend API
       Example:
       fetch('/api/auth/login', {
         method: 'POST',
         body: JSON.stringify({ email, password })
       })
    --- */
    const storedUsers = localStorage.getItem('jurisly_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (foundUser) {
        const userData = { email: foundUser.email, name: foundUser.name };
        setUser(userData);
        localStorage.setItem('jurisly_user', JSON.stringify(userData));
        return true;
      }
    }
    return false;
  };

  const signup = (email: string, password: string, name: string): boolean => {
    /* --- Signup Auth Logic ---
       Currently using localStorage for demo purposes
       In production, send to backend API for secure storage
       Example:
       fetch('/api/auth/signup', {
         method: 'POST',
         body: JSON.stringify({ email, password, name })
       })
    --- */
    const storedUsers = localStorage.getItem('jurisly_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    // Add new user
    users.push({ email, password, name });
    localStorage.setItem('jurisly_users', JSON.stringify(users));
    
    const userData = { email, name };
    setUser(userData);
    localStorage.setItem('jurisly_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jurisly_user');
  };

  /* --- Profile Update Logic ---
     Updates user profile fields (avatar, DOB, etc.)
     In production, sync with backend API
     Example:
     fetch('/api/user/profile', {
       method: 'PATCH',
       body: JSON.stringify(updates)
     })
  --- */
  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('jurisly_user', JSON.stringify(updatedUser));
      
      // Also update in users list
      const storedUsers = localStorage.getItem('jurisly_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userIndex = users.findIndex((u: any) => u.email === user.email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('jurisly_users', JSON.stringify(users));
        }
      }
    }
  };

  /* --- Password Update Logic ---
     Validates current password and updates to new password
     In production, send to secure backend API
     Example:
     fetch('/api/user/change-password', {
       method: 'POST',
       body: JSON.stringify({ currentPassword, newPassword })
     })
  --- */
  const updatePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    
    const storedUsers = localStorage.getItem('jurisly_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex(
        (u: any) => u.email === user.email && u.password === currentPassword
      );
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('jurisly_users', JSON.stringify(users));
        return true;
      }
    }
    return false;
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
