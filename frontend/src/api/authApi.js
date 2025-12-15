import client from './client';

export const authApi = {
  // Login
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials); // URLencoded form data handled by client or manual
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
  },

  // Get Current User (The new function!)
  getMe: async () => {
    const response = await client.get('/users/me');
    return response.data;
  },

  //Logout
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};