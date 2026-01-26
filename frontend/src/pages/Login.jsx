import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import apiClient from '../api/client'
import Card from '../components/Card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login(email, password)
      console.log('login success', data)
      apiClient.defaults.headers.Authorization = `Bearer ${data.access_token}`
      nav('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      setError(err.response?.data?.detail || err.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="p-8 backdrop-blur-xl bg-white/5 border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-400 mt-2">Sign in to manage your wealth</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Email</label>
              <input
                className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white py-3 rounded-lg font-medium shadow-lg shadow-brand-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="flex flex-col gap-2 mt-6 text-center text-sm">
              <p className="text-slate-400">
                Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one</Link>
              </p>
              <Link to="/forgot-password" className="text-slate-500 hover:text-slate-400">
                Forgot Password?
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
