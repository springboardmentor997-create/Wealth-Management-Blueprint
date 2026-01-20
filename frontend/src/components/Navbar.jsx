import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  if (loc.pathname === '/login' || loc.pathname === '/register') return null

  return (
    <nav className="glass sticky top-0 z-40 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-200 tracking-tight flex items-center gap-2">
            {loc.pathname === '/' ? 'Dashboard' : loc.pathname.replace('/', '').charAt(0).toUpperCase() + loc.pathname.slice(2)}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 w-64 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
          <span className="text-slate-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search assets..."
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pl-6 border-l border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-slate-200 flex items-center justify-center font-bold text-lg border-2 border-slate-700/50 shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
