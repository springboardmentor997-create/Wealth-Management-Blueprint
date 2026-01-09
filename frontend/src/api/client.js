import axios from 'axios';

// 1. Create the Axios Instance
const client = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Ensure this matches your FastAPI port
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. THE INTERCEPTOR (Crucial!)
// This function runs BEFORE every request is sent.
client.interceptors.request.use(
  (config) => {
    // Get the token from storage
    const token = localStorage.getItem('token');
    
    // If token exists, attach it to the header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;