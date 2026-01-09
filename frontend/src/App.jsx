import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Pages ---
import LandingPage from './pages/home'; // Make sure this path is correct for your setup
import Dashboard from './pages/dashboard/Dashboard';

// Goals
import GoalsList from './pages/goals/GoalsList';
import GoalCreate from './pages/goals/GoalCreate';
import GoalDetails from './pages/goals/GoalDetails';

// Portfolio
import Portfolio from './pages/portfolio/Portfolio';
import AddInvestment from './pages/portfolio/AddInvestment';
import Transactions from './pages/portfolio/Transactions'; 

// Features
import Simulations from './pages/simulations/Simulation';
import Reports from './pages/reports/Reports'; 
import Recommendations from './pages/recommendations/Recommendations';
import Profile from './pages/profile/Profile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'; 

// Layouts & Auth
import DashboardLayout from './layouts/DashboardLayout'; 
import PrivateRoute from './components/auth/PrivateRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route (Landing + Login Popups) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          
          {/* 1. ADMIN ROUTE (Standalone - No Sidebar) */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 2. USER ROUTES (With Sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Goals */}
            <Route path="/goals" element={<GoalsList />} />
            <Route path="/goals/create" element={<GoalCreate />} />
            <Route path="/goals/:id" element={<GoalDetails />} />
            
            {/* Portfolio */}
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/add" element={<AddInvestment />} />
            <Route path="/portfolio/transactions" element={<Transactions />} />

            {/* Features */}
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;