const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';
// Helper to store JWT
function storeToken(token: string) {
  if (token) {
    localStorage.setItem('auth_token', token);
  }
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  if (data.token) storeToken(data.token);
  return data;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = typeof baseURL === 'string' ? baseURL : 'http://localhost:8080';
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      console.log('Attaching token to header:', this.token.substring(0, 10) + '...');
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      // Re-check storage in case it was set after constructor ran
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        console.log('Restoring token from storage:', storedToken.substring(0, 10) + '...');
        this.token = storedToken;
        headers['Authorization'] = `Bearer ${storedToken}`;
      } else {
        console.warn('No token found in memory or storage');
      }
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    // Timeout wrapper
    const fetchWithTimeout = (resource: RequestInfo, options: RequestInit = {}): Promise<Response> => {
      const { timeout = 30000 } = (options as Record<string, number>); // 30s default (increased from 15s to accommodate slow auth/DB queries)
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
        fetch(resource, options)
          .then(response => {
            clearTimeout(timer);
            resolve(response);
          })
          .catch(err => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetchWithTimeout(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        if (response.status === 401 || (response.status === 403 && response.statusText === 'Forbidden')) {
          // Handle both 401 Unauthorized and 403 Forbidden
          this.clearToken(); // Clear invalid token immediately
          window.dispatchEvent(new Event('auth:unauthorized'));
          // Return a specific error structure that we can ignore or handle gracefully
          throw new Error('Invalid authentication credentials'); 
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            message: `HTTP ${response.status}: ${response.statusText}`,
            detail: 'Failed to parse error response'
          };
        }
        
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error: unknown) {
      if ((error as Error).message === 'Invalid authentication credentials') {
         // Suppress logs for expected auth errors (handled by event)
         console.warn('Authentication expired or invalid');
      } else {
         console.error('API Request Failed:', error);
      }
      throw error;
    }
  }

  private async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async uploadProfileImage(file: File) {
    try {
      const user = await this.uploadFile<Record<string, unknown>>('/api/auth/profile/image', file);
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Generic methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: Record<string, unknown>, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: Record<string, unknown>, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth methods
  async signUp(email: string, password: string, name: string) {
    try {
      await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          name
        }),
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await this.request<{ user: Record<string, unknown>; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('SignIn Response Data:', response);
      
      this.token = response.token;
      if (response.token) {
          localStorage.setItem('auth_token', response.token);
          console.log('Token saved to storage');
      } else {
          console.error('SignIn successful but NO TOKEN in response!', response);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return { error: null };
  }

  async getCurrentUser() {
    try {
      const user = await this.request<Record<string, unknown>>('/api/auth/me');
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Goals methods
  async getGoals() {
    try {
      const goals = await this.request<Record<string, unknown>[]>('/api/goals/');
      return { data: goals, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createGoal(goal: {
    title: string;
    goal_type: string;
    target_amount: number;
    current_amount?: number;
    monthly_contribution: number;
    target_date: string;
  }) {
    try {
      const newGoal = await this.request<Record<string, unknown>>('/api/goals/', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      return { data: newGoal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateGoal(id: string, updates: Record<string, unknown>) {
    try {
      const updatedGoal = await this.request<Record<string, unknown>>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data: updatedGoal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteGoal(id: string) {
    try {
      await this.request(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async updateProfile(updates: Record<string, unknown>) {
    try {
      const updatedUser = await this.request<Record<string, unknown>>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

    async submitKYC(data: FormData) {
        try {
            const headers = this.getHeaders();
            delete (headers as Record<string, string>)['Content-Type'];
            
            const response = await fetch(`${this.baseURL}/kyc/submit`, {
                method: 'POST',
                headers: headers,
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'KYC submission failed');
            }

            const result = await response.json();
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    async getKYCStatus() {
        try {
            const data = await this.get<Record<string, unknown>>('/kyc/status');
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

  // Portfolio methods
  async getPortfolioSummary() {
    try {
      const summary = await this.request<Record<string, unknown>>('/api/portfolio/summary');
      return { data: summary, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getPortfolioHistory(period: string = '6mo') {
    try {
      const history = await this.request<Record<string, unknown>[]>(`/api/portfolio/history?period=${period}`);
      return { data: history, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Investments methods
  async getInvestments() {
    try {
      const investments = await this.request<Record<string, unknown>[]>('/api/investments/');
      return { data: investments, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addInvestment(investment: Record<string, unknown>) {
    try {
      const newInvestment = await this.request<Record<string, unknown>>('/api/investments/', {
        method: 'POST',
        body: JSON.stringify(investment),
      });
      return { data: newInvestment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Transactions methods
  async getTransactions() {
    try {
      const transactions = await this.request<Record<string, unknown>[]>('/api/transactions/');
      return { data: transactions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addTransaction(transaction: Record<string, unknown>) {
    try {
      const newTransaction = await this.request<Record<string, unknown>>('/api/transactions/', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      return { data: newTransaction, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Market methods
  async getMarketIndices() {
    try {
      const indices = await this.request<Record<string, unknown>[]>('/api/market/indices');
      return { data: indices, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getMarketNews() {
    try {
      const news = await this.request<Record<string, unknown>[]>('/api/market/news');
      return { data: news, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async generatePortfolioReport() {
    try {
      const response = await fetch(`${this.baseURL}/api/reports/generate/portfolio`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getRecommendations() {
    try {
      const recs = await this.request<Record<string, unknown>[]>('/api/recommendations/');
      return { data: recs, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getRebalanceRecommendations() {
    try {
      const recs = await this.request<Record<string, unknown>[]>('/api/recommendations/rebalance');
      return { data: recs, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async runSimulation(goalId: string, assumptions: Record<string, unknown>) {
    try {
      const result = await this.request<Record<string, unknown>>(`/api/simulations/goal/${goalId}`, {
        method: 'POST',
        body: JSON.stringify(assumptions),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async runAdhocSimulation(assumptions: Record<string, unknown>) {
    try {
      const result = await this.request<Record<string, unknown>>('/api/simulations/adhoc', {
        method: 'POST',
        body: JSON.stringify(assumptions),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Admin methods
  async getAdminDashboard() {
    try {
      const data = await this.request<Record<string, unknown>>('/api/admin/dashboard');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async exportAdminData(type: 'users' | 'investments', format: 'csv' | 'pdf') {
    try {
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}/api/admin/export?type=${type}&format=${format}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Dashboard methods
  async getDashboardData() {
    try {
      const data = await this.request<Record<string, unknown>>('/api/dashboard/');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Calculator methods
  async calculateSIP(data: { monthly_investment: number; annual_return: number; years: number }) {
    try {
      const result = await this.request<Record<string, unknown>>('/api/calculators/sip', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async calculateRetirement(data: { current_age: number; retirement_age: number; monthly_savings: number; annual_return: number; current_corpus?: number }) {
    try {
      const result = await this.request<Record<string, unknown>>('/api/calculators/retirement', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async calculateLoan(data: { principal: number; rate: number; tenure_years: number }) {
    try {
      const result = await this.request<Record<string, unknown>>('/api/calculators/loan-emi', {
        method: 'POST',
        body: JSON.stringify({
          principal: data.principal,
          annual_rate: data.rate,
          tenure_years: data.tenure_years
        }),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Reports methods
  async getReports() {
    try {
      const reports = await this.request<Record<string, unknown>[]>('/api/reports/');
      return { data: reports, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async downloadFile(reportId: string) {
    try {
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}/api/reports/download/${reportId}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      return { data: blob, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteReport(reportId: string) {
    try {
      await this.request(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async uploadReport(file: File, fileType: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      // Ensure clean URL construction
      // Remove any trailing slashes from baseURL to prevent double slashes
      const cleanBaseUrl = this.baseURL.replace(/\/+$/, '');
      const url = `${cleanBaseUrl}/api/reports/upload`;

      console.log('Preparing upload request...');
      console.log('Final Upload URL:', url);
      console.log('Auth Token Present:', !!this.token);

      // IMPORTANT: Do NOT set Content-Type header manually for FormData
      // The browser will automatically set it to multipart/form-data with the correct boundary
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async generateReport(type: string, format: string) {
    try {
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}/api/reports/generate/${type}?format=${format}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getAllUsers() {
    try {
      const users = await this.request<Record<string, unknown>[]>('/api/admin/users');
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateUser(userId: string, updates: Record<string, unknown>) {
    try {
      const updatedUser = await this.request<Record<string, unknown>>(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.request(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);