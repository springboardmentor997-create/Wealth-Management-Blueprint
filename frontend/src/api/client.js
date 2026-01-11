import axios from 'axios';

// 1. Check if we are in production (Netlify) or local
const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: backendUrl, 
  withCredentials: true 
});

export default client;