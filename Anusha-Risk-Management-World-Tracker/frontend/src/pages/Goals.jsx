import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Goals() {
  const [goals, setGoals] = useState([])
  const [goalProgress, setGoalProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    goal_type: 'retirement',
    target_amount: '',
    target_date: '',
    monthly_contribution: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/goals`)
      setGoals(response.data)
      
      // Fetch progress for each goal
      const progressPromises = response.data.map(goal =>
        axios.get(`${API_URL}/api/goals/${goal.id}/progress`)
          .then(res => ({ goalId: goal.id, progress: res.data }))
          .catch(() => ({ goalId: goal.id, progress: null }))
      )
      const progressResults = await Promise.all(progressPromises)
      const progressMap = {}
      progressResults.forEach(({ goalId, progress }) => {
        progressMap[goalId] = progress
      })
      setGoalProgress(progressMap)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await axios.post(`${API_URL}/api/goals`, {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        monthly_contribution: parseFloat(formData.monthly_contribution),
      })
      setShowForm(false)
      setFormData({
        goal_type: 'retirement',
        target_amount: '',
        target_date: '',
        monthly_contribution: '',
      })
      fetchGoals()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create goal')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return
    }

    try {
      await axios.delete(`${API_URL}/api/goals/${id}`)
      fetchGoals()
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const goalTypeLabels = {
    retirement: 'Retirement',
    home: 'Home Purchase',
    education: 'Education',
    custom: 'Custom',
  }

  const statusLabels = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Goals
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your financial goals and track progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Goal</h2>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal_type" className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                name="goal_type"
                id="goal_type"
                value={formData.goal_type}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="retirement">Retirement</option>
                <option value="home">Home Purchase</option>
                <option value="education">Education</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700">
                Target Amount ($)
              </label>
              <input
                type="number"
                name="target_amount"
                id="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className="input-modern"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                id="target_date"
                value={formData.target_date}
                onChange={handleChange}
                className="input-modern"
                required
              />
            </div>

            <div>
              <label htmlFor="monthly_contribution" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                name="monthly_contribution"
                id="monthly_contribution"
                value={formData.monthly_contribution}
                onChange={handleChange}
                className="input-modern"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
          <p className="text-gray-500 text-lg">No goals yet. Create your first goal to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {goalTypeLabels[goal.goal_type] || goal.goal_type}
                  </h3>
                  <span
                    className={`inline-flex mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      goal.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : goal.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[goal.status] || goal.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>

              {goalProgress[goal.id] && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {goalProgress[goal.id].progress_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        goalProgress[goal.id].is_on_track
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${Math.min(goalProgress[goal.id].progress_percent, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${goalProgress[goal.id].current_savings.toLocaleString()}</span>
                    <span>${parseFloat(goal.target_amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Amount:</span>
                  <span className="font-medium">
                    ${parseFloat(goal.target_amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Date:</span>
                  <span className="font-medium">
                    {new Date(goal.target_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Contribution:</span>
                  <span className="font-medium">
                    ${parseFloat(goal.monthly_contribution).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {goalProgress[goal.id] && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Months Remaining:</span>
                      <span className="font-medium">
                        {goalProgress[goal.id].months_remaining}
                      </span>
                    </div>
                    {!goalProgress[goal.id].is_on_track && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg">
                        <p className="text-yellow-800 text-sm font-medium">
                          ⚠️ Projected Shortfall: ${goalProgress[goal.id].shortfall.toLocaleString()}
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Consider increasing monthly contribution to ${goalProgress[goal.id].required_monthly_contribution?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Goals

