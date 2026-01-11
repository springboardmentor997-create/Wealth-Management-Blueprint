import axios from 'axios';

// 1. Check if we are in production (Netlify) or local
const backendUrl = 'https://wealth-plan-api.onrender.com';

const client = axios.create({
  baseURL: backendUrl, 
  withCredentials: true 
});

export default client;