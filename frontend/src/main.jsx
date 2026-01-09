import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css'; 

// 1. IMPORT THE PROVIDER (Check this path matches your folder structure!)
import { AuthProvider } from './context/AuthContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. WRAP THE APP SO 'useAuth' WORKS */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);