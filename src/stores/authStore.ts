import { create } from 'zustand';
import { authService } from '../services/authService';
import type { AuthResponse } from '../services/authService';

interface User {
  id: number;
  name: string;
  email: string;
  risk_profile?: string;
  kyc_status?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authService.login({ email, password });
      authService.setTokens(response.access_token, response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Login failed. Make sure backend is running.';
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (name, email, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authService.register({
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      authService.setTokens(response.access_token, response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Registration failed. Make sure backend is running.';
      console.error('Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const token = authService.getAccessToken();
    const user = authService.getCurrentUser();
    if (token && user) {
      set({
        user,
        isAuthenticated: true,
      });
    }
  },
}));
