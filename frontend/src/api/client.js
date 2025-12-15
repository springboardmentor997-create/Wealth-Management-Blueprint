import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Make sure this points to port 8000!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;