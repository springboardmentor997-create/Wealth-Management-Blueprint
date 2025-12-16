// API Service - Placeholder for FastAPI backend integration
// Replace BASE_URL with your FastAPI server URL
const BASE_URL = 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// Generic API fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token refresh if 401
      if (response.status === 401 && refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry original request
          return apiFetch<T>(endpoint, options);
        }
      }
      return { error: data.detail || 'An error occurred', status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    return { error: 'Network error', status: 0 };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    }
  } catch {
    clearTokens();
  }
  return false;
}

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    apiFetch<{ access_token: string; refresh_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch<User>('/auth/me'),
};

// Users endpoints
export const usersApi = {
  getProfile: () => apiFetch<UserProfile>('/users/profile'),
  updateProfile: (data: Partial<UserProfile>) =>
    apiFetch<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateRiskProfile: (data: RiskProfile) =>
    apiFetch<UserProfile>('/users/risk-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Goals endpoints
export const goalsApi = {
  getAll: () => apiFetch<Goal[]>('/goals'),
  getById: (id: string) => apiFetch<Goal>(`/goals/${id}`),
  create: (data: CreateGoalData) =>
    apiFetch<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Goal>) =>
    apiFetch<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => apiFetch(`/goals/${id}`, { method: 'DELETE' }),
};

// Portfolio endpoints
export const portfolioApi = {
  getSummary: () => apiFetch<PortfolioSummary>('/portfolio/summary'),
  getInvestments: () => apiFetch<Investment[]>('/portfolio/investments'),
  getTransactions: (params?: TransactionFilters) =>
    apiFetch<Transaction[]>(`/portfolio/transactions${params ? `?${new URLSearchParams(params as any)}` : ''}`),
  addInvestment: (data: Partial<Investment>) =>
    apiFetch<Investment>('/portfolio/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Recommendations endpoints
export const recommendationsApi = {
  getRecommendations: () => apiFetch<Recommendation[]>('/recommendations'),
  getAllocation: () => apiFetch<AllocationRecommendation>('/recommendations/allocation'),
};

// Simulations endpoints
export const simulationsApi = {
  runSimulation: (params: SimulationParams) =>
    apiFetch<SimulationResult>('/simulations/run', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getHistory: () => apiFetch<SimulationResult[]>('/simulations/history'),
};

// Reports endpoints
export const reportsApi = {
  generateReport: (type: ReportType, params?: ReportParams) =>
    apiFetch<ReportData>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, ...params }),
    }),
  exportPdf: (reportId: string) => apiFetch<Blob>(`/reports/${reportId}/export/pdf`),
};

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile extends User {
  phone?: string;
  avatar_url?: string;
  risk_profile?: RiskProfile;
  investment_experience?: string;
  annual_income?: number;
}

export interface RiskProfile {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_horizon: string;
  financial_goals: string[];
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: 'retirement' | 'education' | 'house' | 'emergency' | 'travel' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'on_track' | 'at_risk' | 'behind';
  created_at: string;
}

export interface CreateGoalData {
  name: string;
  target_amount: number;
  deadline: string;
  category: Goal['category'];
  priority: Goal['priority'];
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'bond' | 'crypto' | 'mutual_fund';
  quantity: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  gain_loss: number;
  gain_loss_percentage: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  symbol?: string;
  amount: number;
  quantity?: number;
  price?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionFilters {
  type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
  asset_allocation: { [key: string]: number };
  performance_history: { date: string; value: number }[];
}

export interface Recommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  symbol?: string;
  name: string;
  reason: string;
  confidence: number;
  created_at: string;
}

export interface AllocationRecommendation {
  current_allocation: { [key: string]: number };
  recommended_allocation: { [key: string]: number };
  adjustments: {
    asset_class: string;
    current: number;
    recommended: number;
    action: string;
  }[];
}

export interface SimulationParams {
  initial_investment: number;
  monthly_contribution: number;
  years: number;
  risk_level: 'low' | 'medium' | 'high';
  inflation_rate?: number;
}

export interface SimulationResult {
  id: string;
  params: SimulationParams;
  projected_value: number;
  best_case: number;
  worst_case: number;
  timeline: { year: number; value: number; contributions: number }[];
  created_at: string;
}

export type ReportType = 'portfolio' | 'performance' | 'tax' | 'goals';

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  include_charts?: boolean;
}

export interface ReportData {
  id: string;
  type: ReportType;
  generated_at: string;
  data: any;
}
// TEMP: Simple dashboard summary (matches current FastAPI)
export const getDashboardSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/summary`);
  return res.json();
};
