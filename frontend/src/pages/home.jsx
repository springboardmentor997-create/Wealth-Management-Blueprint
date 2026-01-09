import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPopup from '../components/auth/AuthPopup';

export default function Home() {
  const navigate = useNavigate();
  const [isAuthOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 py-4 w-full">
        <div className="text-2xl font-bold text-slate-900">WealthPlan</div>
        <div className="space-x-4">
          <button
            onClick={() => setAuthOpen(true)}
            className="text-slate-600 font-medium hover:text-blue-600"
          >
            Login
          </button>
          <button
            onClick={() => setAuthOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="max-w-7xl mx-auto px-8 mt-16 md:mt-24 flex flex-col md:flex-row items-center">
        {/* Left Side: Text */}
        <div className="md:w-1/2 pr-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Manage your <span className="text-blue-600">Wealth</span> with confidence.
          </h1>
          <p className="mt-6 text-xl text-slate-500 leading-relaxed">
            All-in-one platform for goal planning, portfolio tracking, and smart financial simulations.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setAuthOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1"
            >
              Get Started for Free
            </button>
          </div>
        </div>

        {/* Right Side: Growth Animation Module */}
        <div className="md:w-1/2 mt-16 md:mt-0 relative">
          {/* Main Container with Glass Effect */}
          <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl overflow-hidden">

            {/* Header: Net Worth Status */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Projected Net Worth</p>
                <h3 className="text-4xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                  $145,250.00
                  {/* Animated pulsing dot indicating live data */}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </h3>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 animate-bounce-slow">
                Is growing 🔥
              </div>
            </div>

            {/* The Animated Bars Visualization */}
            <div className="flex items-end justify-between gap-3 h-48 relative z-10">
              {/* Bar 1 - Slowest */}
              <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-2xl animate-[pulse_3s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
              {/* Bar 2 */}
              <div className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-2xl animate-[pulse_2.5s_ease-in-out_infinite_0.5s]" style={{ height: '65%' }}></div>
              {/* Bar 3 */}
              <div className="w-full bg-gradient-to-t from-blue-700 to-cyan-600 rounded-t-2xl animate-[pulse_2s_ease-in-out_infinite_1s]" style={{ height: '85%' }}></div>
              {/* Bar 4 - Fastest & Tallest (The "Growth" spike) */}
              <div className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-2xl animate-[pulse_1.5s_ease-in-out_infinite_1.5s] shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ height: '100%' }}>
                {/* Floating badge on top of the tallest bar */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-3 rounded-full whitespace-nowrap">
                  Goal On Track
                </div>
              </div>
            </div>

            {/* Decorative background glow inside the card */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/20 to-transparent blur-xl"></div>
          </div>

          {/* Decorative Blobs outside the card for depth */}
          <div className="absolute -z-10 top-0 -right-10 w-72 h-72 bg-purple-300 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
          <div className="absolute -z-10 bottom-0 -left-10 w-72 h-72 bg-blue-300 rounded-full blur-[120px] opacity-40 animate-pulse-slow delay-1000"></div>
        </div>
      </main>

      {/* 3. Features Section */}
      <section className="py-20 bg-slate-50 mt-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to grow wealth</h2>
            <p className="text-slate-500 mt-4">Smart tools that help you make better financial decisions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6">🎯</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Goal Planning</h3>
              <p className="text-slate-500 leading-relaxed">Set targets for buying a home, retirement, or travel and track your progress in real-time.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-500 leading-relaxed">Visualize your net worth with advanced charts and get AI-driven insights on your portfolio.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Profiling</h3>
              <p className="text-slate-500 leading-relaxed">Understand your investment style with our standard industry risk assessment algorithms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Auth Popup Component */}
      <AuthPopup
        isOpen={isAuthOpen}
        onClose={() => setAuthOpen(false)}
      />

    </div>
  );
}