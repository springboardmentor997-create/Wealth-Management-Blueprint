import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [allocation, setAllocation] = useState(null)
  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recsRes, allocRes, goalsRes] = await Promise.all([
        axios.get(`${API_URL}/api/recommendations`),
        axios.get(`${API_URL}/api/recommendations/allocation/current`),
        axios.get(`${API_URL}/api/goals`),
      ])
      setRecommendations(recsRes.data)
      setAllocation(allocRes.data)
      setGoals(goalsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendation = async () => {
    try {
      const goalId = selectedGoal || null
      await axios.post(`${API_URL}/api/recommendations/generate`, null, {
        params: goalId ? { goal_id: goalId } : {}
      })
      fetchData()
    } catch (error) {
      console.error('Failed to generate recommendation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const currentAllocationData = allocation?.current_allocation
    ? Object.entries(allocation.current_allocation).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: parseFloat(value),
      }))
    : []

  const recommendedAllocationData = allocation?.recommended_allocation
    ? Object.entries(allocation.recommended_allocation).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: parseFloat(data.percentage),
      }))
    : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Recommendations
          </h1>
          <p className="mt-2 text-gray-600">
            Personalized investment recommendations based on your risk profile
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="input-modern"
          >
            <option value="">All Goals</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.goal_type}
              </option>
            ))}
          </select>
          <button
            onClick={generateRecommendation}
            className="btn-primary"
          >
            Generate Recommendations
          </button>
        </div>
      </div>

      {allocation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Allocation</h2>
            {currentAllocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No investments yet</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Allocation</h2>
            {recommendedAllocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recommendedAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recommendedAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Generate recommendations to see suggested allocation</p>
            )}
          </div>
        </div>
      )}

      {allocation?.rebalance_suggestions && allocation.rebalance_suggestions.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rebalancing Suggestions</h2>
          <div className="space-y-3">
            {allocation.rebalance_suggestions.map((suggestion, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{suggestion.asset_type.charAt(0).toUpperCase() + suggestion.asset_type.slice(1)}</p>
                  <p className="text-sm text-gray-600">
                    Current: {suggestion.current_allocation}% → Target: {suggestion.target_allocation}%
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${suggestion.action === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {suggestion.action === 'increase' ? '+' : '-'}${Math.abs(suggestion.adjustment_amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{rec.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(rec.created_at).toLocaleDateString()}
              </span>
            </div>
            {rec.recommendation_text && (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {rec.recommendation_text}
                </pre>
              </div>
            )}
            {rec.suggested_allocation && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Suggested Allocation:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(rec.suggested_allocation.recommended_allocation || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="text-sm font-semibold">{value.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
            <span className="text-4xl">💡</span>
          </div>
          <p className="text-gray-500 text-lg">No recommendations yet. Generate your first recommendation!</p>
        </div>
      )}
    </div>
  )
}

export default Recommendations

