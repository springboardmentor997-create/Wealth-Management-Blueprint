const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = typeof baseURL === 'string' ? baseURL : 'http://localhost:8000';
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

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        if (response.status === 401 || (response.status === 403 && response.statusText === 'Forbidden')) {
          // Handle both 401 Unauthorized and 403 Forbidden (often used for missing auth in FastAPI)
          this.clearToken(); // Clear invalid token immediately
          window.dispatchEvent(new Event('auth:unauthorized'));
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
    } catch (error: any) {
      console.error('API Request Failed:', error);
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
      const user = await this.uploadFile<any>('/api/auth/profile/image', file);
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Generic methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
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
      const response = await this.request<{ user: any; token: string }>('/api/auth/login', {
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
      const user = await this.request<any>('/api/auth/me');
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Goals methods
  async getGoals() {
    try {
      const goals = await this.request<any[]>('/api/goals/');
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
      const newGoal = await this.request<any>('/api/goals/', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      return { data: newGoal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateGoal(id: string, updates: any) {
    try {
      const updatedGoal = await this.request<any>(`/api/goals/${id}`, {
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

  async updateProfile(updates: any) {
    try {
      const updatedUser = await this.request<any>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updatePassword(data: any) {
    try {
      const result = await this.request<any>('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Portfolio methods
  async getPortfolioSummary() {
    try {
      const summary = await this.request<any>('/api/portfolio/summary');
      return { data: summary, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getPortfolioHistory(period: string = '6mo') {
    try {
      const history = await this.request<any[]>(`/api/portfolio/history?period=${period}`);
      return { data: history, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Investments methods
  async getInvestments() {
    try {
      const investments = await this.request<any[]>('/api/investments/');
      return { data: investments, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addInvestment(investment: any) {
    try {
      const newInvestment = await this.request<any>('/api/investments/', {
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
      const transactions = await this.request<any[]>('/api/transactions/');
      return { data: transactions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addTransaction(transaction: any) {
    try {
      const newTransaction = await this.request<any>('/api/transactions/', {
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
      const indices = await this.request<any[]>('/api/market/indices');
      return { data: indices, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getMarketNews() {
    try {
      const news = await this.request<any[]>('/api/market/news');
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
      const recs = await this.request<any[]>('/api/recommendations/');
      return { data: recs, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getRebalanceRecommendations() {
    try {
      const recs = await this.request<any[]>('/api/recommendations/rebalance');
      return { data: recs, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async runSimulation(goalId: string, assumptions: any) {
    try {
      const result = await this.request<any>(`/api/simulations/goal/${goalId}`, {
        method: 'POST',
        body: JSON.stringify(assumptions),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async runAdhocSimulation(assumptions: any) {
    try {
      const result = await this.request<any>('/api/simulations/adhoc', {
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
      const data = await this.request<any>('/api/admin/dashboard');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateUserCredits(userId: string, amount: number, action: 'add' | 'deduct') {
    try {
      const result = await this.request<any>(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amount,
          action: action
        })
      });
      return { data: result, error: null };
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
      const data = await this.request<any>('/api/dashboard/');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Calculator methods
  async calculateSIP(data: { monthly_investment: number; annual_return: number; years: number }) {
    try {
      const result = await this.request<any>('/api/calculators/sip', {
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
      const result = await this.request<any>('/api/calculators/retirement', {
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
      const result = await this.request<any>('/api/calculators/loan', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Reports methods
  async getReports() {
    try {
      const reports = await this.request<any[]>('/api/reports/');
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
      const users = await this.request<any[]>('/api/admin/users');
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateUser(userId: string, updates: any) {
    try {
      const updatedUser = await this.request<any>(`/api/admin/users/${userId}`, {
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