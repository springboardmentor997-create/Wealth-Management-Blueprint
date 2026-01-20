import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/services/api';
import { mockUser } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In production, validate token with backend
      // For now, simulate auto-login with mock user
      setUser(mockUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, call authApi.login(email, password)
      // For now, accept any credentials
      if (email && password) {
        localStorage.setItem('accessToken', 'mock-token');
        localStorage.setItem('refreshToken', 'mock-refresh-token');
        setUser({ ...mockUser, email });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string }): Promise<boolean> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, call authApi.register(data)
      if (data.email && data.password) {
        localStorage.setItem('accessToken', 'mock-token');
        localStorage.setItem('refreshToken', 'mock-refresh-token');
        setUser({
          id: Date.now().toString(),
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          created_at: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
