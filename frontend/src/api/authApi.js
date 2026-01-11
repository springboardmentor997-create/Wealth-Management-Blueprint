// src/api/authApi.js

// 1. Import the client you fixed earlier
import client from './client'; 

export const authApi = {
  // 2. Use 'client' instead of 'axios'
  register: async (userData) => {
    // client already knows the baseURL (Render URL)
    const response = await client.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    // (Optional) If you have login logic here too, update it
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);
    
    const response = await client.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  
  // Keep other functions if you have them...
};