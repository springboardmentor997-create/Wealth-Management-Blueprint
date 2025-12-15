import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPopup from '../components/auth/AuthPopup'; // Import the new popup

export default function Home() {
  const navigate = useNavigate();
  const [isAuthOpen, setAuthOpen] = useState(false); // State to control popup

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-slate-900">WealthPlan</div>
        <div className="space-x-4">
          <button 
            onClick={() => setAuthOpen(true)} // Open Popup
            className="text-slate-600 font-medium hover:text-blue-600"
          >
            Login
          </button>
          <button 
            onClick={() => setAuthOpen(true)} // Open Popup
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="max-w-7xl mx-auto px-8 mt-16 md:mt-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 pr-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Manage your <span className="text-blue-600">Wealth</span> with confidence.
          </h1>
          <p className="mt-6 text-xl text-slate-500 leading-relaxed">
            All-in-one platform for goal planning, portfolio tracking, and smart financial simulations.
          </p>
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => setAuthOpen(true)} // Open Popup
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1"
            >
              Get Started for Free
            </button>
          </div>
        </div>
        
        {/* Placeholder for Hero Image */}
        <div className="md:w-1/2 mt-12 md:mt-0">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Wealth Management" 
            className="rounded-3xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500"
          />
        </div>
      </main>

      {/* 3. The Auth Popup Component (Hidden by default) */}
      <AuthPopup 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
      />

    </div>
  );
}