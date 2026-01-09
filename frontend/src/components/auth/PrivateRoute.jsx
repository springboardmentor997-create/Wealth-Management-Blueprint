import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // 1. Check if the "Key" exists in the browser's pocket
  const token = localStorage.getItem('token');

  // 2. If Key exists, let them in (Outlet). If not, kick them out (Navigate to Home).
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;