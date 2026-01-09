import client from './client';

export const authApi = {
  // Login (Updated to fix the "Authentication Failed" error)
  login: async ({ email, password }) => {
    // 1. Create a Form Data object (not JSON)
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI strictly wants a field named 'username', even if it's an email!
    formData.append('password', password);

    // 2. Send as 'application/x-www-form-urlencoded'
    const response = await client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // 3. Save the token immediately
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
  },

  // Get Current User
  getMe: async () => {
    const response = await client.get('/users/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/'; // <--- Updated to go to Home Page
  }, // <--- THIS COMMA WAS MISSING!

  // Fetch all users (Admin only)
  getAllUsers: async () => {
    const response = await client.get('/users/all'); 
    return response.data;
  }
};