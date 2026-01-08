import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminLoading: boolean;
  adminSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  adminSignOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'wealthtrack_admin_session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedSession = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedSession === 'true') {
        // Verify token and admin status with backend
        const { data } = await apiClient.getCurrentUser();
        if (data && data.user.is_admin === 'true') {
           setIsAdmin(true);
        } else {
           // Token invalid or not admin
           setIsAdmin(false);
           localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
      }
      setAdminLoading(false);
    };
    checkAdminStatus();
  }, []);

  const adminSignIn = async (email: string, password: string) => {
    const { data, error } = await apiClient.signIn(email, password);

    if (error) {
      toast({
        title: "Admin login failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data && data.user.is_admin === 'true') {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard",
      });
      return { error: null };
    } else {
       // Not an admin
       await apiClient.signOut();
       const err = new Error('Access denied. Admin privileges required.');
       toast({
        title: "Admin login failed",
        description: "Access denied. Admin privileges required.",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const adminSignOut = async () => {
    await apiClient.signOut();
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    toast({
      title: "Signed out",
      description: "You have been signed out from admin",
    });
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, adminLoading, adminSignIn, adminSignOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
