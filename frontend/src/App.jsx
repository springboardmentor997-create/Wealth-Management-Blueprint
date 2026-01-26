import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import Dashboard from './pages/dashboard/Dashboard'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Goals from './pages/Goals'
import Portfolio from './pages/Portfolio'
import Simulations from './pages/Simulations'
import Calculators from './pages/Calculators'
import Profile from './pages/Profile'
import Reports from './pages/Reports'

function Protected({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-slate-400">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/goals" element={<Protected><Goals /></Protected>} />
            <Route path="/portfolio" element={<Protected><Portfolio /></Protected>} />
            <Route path="/reports" element={<Protected><Reports /></Protected>} />
            <Route path="/calculators" element={<Protected><Calculators /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
          </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600">Error: {this.state.error?.message}</div>
    }
    return this.props.children
  }
}
