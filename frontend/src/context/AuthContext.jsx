// 1. ADD 'useContext' to imports
import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on refresh
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Ensure your authApi has a getMe() function!
          const userData = await authApi.getMe(); 
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid:", error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    // Ensure your authApi.login returns the token object
    const data = await authApi.login(credentials);
    
    // Save token
    localStorage.setItem('access_token', data.access_token);
    
    // Fetch user details immediately
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const logout = () => {
    // Check if authApi.logout exists, otherwise just remove token locally
    if (authApi.logout) authApi.logout(); 
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. ADD THIS CUSTOM HOOK AT THE BOTTOM
// This is what allows your components to say "const { login } = useAuth();"
export const useAuth = () => {
  return useContext(AuthContext);
};