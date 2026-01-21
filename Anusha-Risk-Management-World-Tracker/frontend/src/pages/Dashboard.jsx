import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Dashboard() {
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    totalInvestments: 0,
    portfolioValue: 0,
    totalGain: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentGoals, setRecentGoals] = useState([])
  const [goals, setGoals] = useState([])
  const [investments, setInvestments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [analytics, setAnalytics] = useState({
    monthlyGrowth: [],
    portfolioDistribution: [],
    goalProgress: [],
    riskBreakdown: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [goalsRes, investmentsRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/goals`),
        axios.get(`${API_URL}/api/investments`),
        axios.get(`${API_URL}/api/transactions`),
      ])

      const goals = goalsRes.data.goals || goalsRes.data
      const investments = investmentsRes.data.investments || investmentsRes.data
      const transactions = transactionsRes.data.transactions || transactionsRes.data

      const totalGoals = goals.length
      const activeGoals = goals.filter((g) => g.status === 'active').length
      const totalInvestments = investments.length
      const portfolioValue = investments.reduce(
        (sum, inv) => sum + (parseFloat(inv.current_value) || parseFloat(inv.cost_basis) || 0),
        0
      )
      const totalCost = investments.reduce(
        (sum, inv) => sum + (parseFloat(inv.cost_basis) || 0),
        0
      )
      const totalGain = portfolioValue - totalCost

      // Generate analytics data
      const monthlyGrowth = generateMonthlyGrowthData(transactions)
      const portfolioDistribution = generatePortfolioDistribution(investments)
      const goalProgress = generateGoalProgressData(goals)
      const riskBreakdown = generateRiskBreakdown(investments)

      setStats({
        totalGoals,
        activeGoals,
        totalInvestments,
        portfolioValue,
        totalGain,
      })
      setGoals(goals)
      setInvestments(investments)
      setTransactions(transactions)
      setRecentGoals(goals.slice(0, 3))
      setAnalytics({
        monthlyGrowth,
        portfolioDistribution,
        goalProgress,
        riskBreakdown
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyGrowthData = (transactions) => {
    const monthlyData = {}
    const currentYear = new Date().getFullYear()
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date || transaction.executed_at)
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[month]) {
        monthlyData[month] = 0
      }
      
      if (transaction.type === 'buy' || transaction.type === 'contribution') {
        monthlyData[month] += parseFloat(transaction.amount) || 0
      }
    })

    return Object.entries(monthlyData).map(([name, value]) => ({
      name,
      value
    }))
  }

  const generatePortfolioDistribution = (investments) => {
    const distribution = {}
    
    investments.forEach(inv => {
      const type = inv.asset_type || inv.investment_type || 'stock'
      const value = parseFloat(inv.current_value) || parseFloat(inv.cost_basis) || 0
      
      if (!distribution[type]) {
        distribution[type] = 0
      }
      distribution[type] += value
    })

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  }

  const generateGoalProgressData = (goals) => {
    return goals.slice(0, 5).map(goal => ({
      name: goal.title || goal.goal_type,
      progress: parseFloat(goal.current_amount || 0),
      target: parseFloat(goal.target_amount || 0),
      percentage: Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    }))
  }

  const generateRiskBreakdown = (investments) => {
    const riskData = {
      conservative: 0,
      moderate: 0,
      aggressive: 0
    }
    
    investments.forEach(inv => {
      // For demo purposes, assume risk based on asset type
      const risk = inv.asset_type === 'bond' || inv.asset_type === 'cash' ? 'conservative' : 
                   inv.asset_type === 'etf' || inv.asset_type === 'mutual_fund' ? 'moderate' : 'aggressive'
      const value = parseFloat(inv.current_value) || parseFloat(inv.cost_basis) || 0
      riskData[risk] += value
    })

    return Object.entries(riskData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const COLORS = ['#667eea', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive financial insights and performance tracking
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/goals"
            className="btn-primary"
          >
            + New Goal
          </Link>
          <Link
            to="/portfolio"
            className="btn-secondary"
          >
            View Portfolio
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Portfolio Value</p>
              <p className="text-3xl font-bold mt-2">
                ${stats.portfolioValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className={`text-sm mt-2 ${stats.totalGain >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {stats.totalGain >= 0 ? '↑' : '↓'} ${Math.abs(stats.totalGain).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalGoals}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {stats.activeGoals} active
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Investments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalInvestments}
              </p>
              <p className="text-sm text-primary-600 mt-2">
                Holdings
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl">💼</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Goals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeGoals}
              </p>
              <p className="text-sm text-green-600 mt-2">
                In progress
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Growth Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.monthlyGrowth.length > 0 ? analytics.monthlyGrowth : [
              { name: 'Jan', value: 4000 },
              { name: 'Feb', value: 3000 },
              { name: 'Mar', value: 5000 },
              { name: 'Apr', value: 4500 },
              { name: 'May', value: 6000 },
              { name: 'Jun', value: 5500 },
            ]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#667eea" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Distribution */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.portfolioDistribution.length > 0 ? analytics.portfolioDistribution : [
                  { name: 'Stocks', value: 45 },
                  { name: 'ETFs', value: 25 },
                  { name: 'Bonds', value: 15 },
                  { name: 'Cash', value: 10 },
                  { name: 'Mutual Funds', value: 5 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {analytics.portfolioDistribution.length > 0 ? analytics.portfolioDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                )) : [0, 1, 2, 3, 4].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal Progress and Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Progress Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Goal Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.goalProgress.length > 0 ? analytics.goalProgress : [
              { name: 'Retirement', progress: 75000, target: 100000, percentage: 75 },
              { name: 'Home', progress: 15000, target: 50000, percentage: 30 },
              { name: 'Education', progress: 8000, target: 20000, percentage: 40 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="progress" fill="#10b981" />
              <Bar dataKey="target" fill="#e5e7eb" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Breakdown */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Profile Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.riskBreakdown.length > 0 ? analytics.riskBreakdown : [
                  { name: 'Conservative', value: 15000 },
                  { name: 'Moderate', value: 35000 },
                  { name: 'Aggressive', value: 20000 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {analytics.riskBreakdown.length > 0 ? analytics.riskBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                )) : [0, 1, 2].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            to="/goals"
            className="flex items-center p-4 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Create Goal</p>
              <p className="text-sm text-gray-600">Set a new financial target</p>
            </div>
          </Link>
          <Link
            to="/portfolio"
            className="flex items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">💼</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Add Investment</p>
              <p className="text-sm text-gray-600">Track your assets</p>
            </div>
          </Link>
          <Link
            to="/simulations"
            className="flex items-center p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">🔮</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Run Simulation</p>
              <p className="text-sm text-gray-600">What-if scenarios</p>
            </div>
          </Link>
          <Link
            to="/recommendations"
            className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">💡</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Get Recommendations</p>
              <p className="text-sm text-gray-600">Personalized advice</p>
            </div>
          </Link>
          <Link
            to="/reports"
            className="flex items-center p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">📄</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Download Reports</p>
              <p className="text-sm text-gray-600">PDF & CSV exports</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Goals */}
      {recentGoals.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentGoals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-lg border-2 border-gray-100 hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary-600">
                    {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${parseFloat(goal.target_amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
