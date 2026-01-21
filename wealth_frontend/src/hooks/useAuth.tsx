import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  risk_profile: string;
  kyc_status?: string;
  is_admin?: string;
  profile_picture?: string;
  credits?: number;
  login_count?: number;
  last_login?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession({ user: parsedUser });
          apiClient.setToken(token);
        } catch (error) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      signOut();
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await apiClient.signUp(email, password, name);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Account created!",
      description: "Welcome to WealthTrack",
    });
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await apiClient.signIn(email, password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data) {
      setUser(data.user);
      setSession({ user: data.user });
    }

    return { error: null };
  };

  const signOut = async () => {
    await apiClient.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setSession({ user: updatedUser });
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateUser }}>
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
