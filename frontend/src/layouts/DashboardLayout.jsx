import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar'; // Ensure this path matches your folder structure

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* 1. Sidebar (Fixed on Left) */}
      <Sidebar />

      {/* 2. Main Content Area (Scrollable on Right) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* You can add a Top Navigation Bar here if you want later */}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          {/* Outlet renders the child route (Dashboard, Portfolio, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;