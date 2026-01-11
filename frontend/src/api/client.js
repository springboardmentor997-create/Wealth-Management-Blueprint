import axios from 'axios';

// 1. Create the client with your Render Backend URL
const client = axios.create({
  baseURL: 'https://wealth-plan-api.onrender.com', 
});

// 2. THE MISSING PIECE: The Request Interceptor 🕵️‍♂️
// This runs before EVERY request to attach the token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Attach the token to the header: "Authorization: Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;