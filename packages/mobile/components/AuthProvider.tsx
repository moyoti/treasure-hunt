import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getStoredToken, getStoredUser, storeAuth, clearAuth } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await getStoredUser();
      const token = await getStoredToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      // Token should be stored separately during login
    } else {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
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