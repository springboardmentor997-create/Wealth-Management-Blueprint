import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const loc = useLocation()
  const isActive = (path) => loc.pathname === path

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/portfolio', label: 'Portfolio', icon: '📈' },
    { path: '/market', label: 'Market Data', icon: '🔍' },
    { path: '/watchlist', label: 'Watchlist', icon: '⭐' },
    { path: '/suggestions', label: 'Suggestions', icon: '💡' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/simulations', label: 'Simulations', icon: '🎲' },
    { path: '/calculators', label: 'Calculators', icon: '🧮' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  if (['/login', '/register'].includes(loc.pathname)) return null

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col font-medium transition-all duration-300">
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-indigo-500/20 to-transparent">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-2xl drop-shadow-md">⚡</span>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">WealthMGR</span>
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive(link.path)
                ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 text-slate-100 translate-x-1'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:translate-x-1'
              }
            `}
          >
            <span className={`text-xl transition-transform duration-300 ${isActive(link.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
              {link.icon}
            </span>
            <span>{link.label}</span>
            {isActive(link.path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-center text-slate-500 border border-slate-700/50">
          v2.0.0 <span className="text-emerald-500">•</span> Online
        </div>
      </div>
    </aside>
  )
}
