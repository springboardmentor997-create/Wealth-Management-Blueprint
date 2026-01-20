import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [form, setForm] = useState({ goal_type: 'retirement', target_amount: '', target_date: '', monthly_contribution: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setError(null)
      const res = await axios.get('http://localhost:8000/goals/')
      setGoals(res.data)
    } catch (err) {
      console.error('Error loading goals:', err)
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      if (editing) {
        await axios.put(`http://localhost:8000/goals/${editing}`, form)
        setEditing(null)
      } else {
        await axios.post('http://localhost:8000/goals/', form)
      }
      setForm({ goal_type: 'retirement', target_amount: '', target_date: '', monthly_contribution: '' })
      await loadGoals()
    } catch (err) {
      console.error('Error saving goal:', err)
      setError(err.response?.data?.detail || 'Error saving goal')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        setError(null)
        await axios.delete(`http://localhost:8000/goals/${id}`)
        await loadGoals()
      } catch (err) {
        console.error('Error deleting goal:', err)
        setError(err.response?.data?.detail || 'Error deleting goal')
      }
    }
  }

  const handleEdit = (goal) => {
    setEditing(goal.id)
    setForm({
      goal_type: goal.goal_type,
      target_amount: goal.target_amount,
      target_date: goal.target_date,
      monthly_contribution: goal.monthly_contribution
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setForm({ goal_type: 'retirement', target_amount: '', target_date: '', monthly_contribution: '' })
  }

  if (loading) return <p className="text-lg">Loading goals...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-200 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">🎯 Goals</h1>

      {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded mb-4">{error}</div>}

      <div className="glass-card p-6 mb-8 animate-fade-in-up">
        <h2 className="text-xl font-bold mb-6 text-slate-200 border-b border-slate-700/50 pb-2">{editing ? 'Edit Goal' : 'Create New Goal'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select value={form.goal_type} onChange={e => setForm({ ...form, goal_type: e.target.value })} className="form-input bg-slate-900/50">
              <option value="retirement">Retirement</option>
              <option value="home">Home</option>
              <option value="education">Education</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="number"
              placeholder="Target Amount (₹)"
              value={form.target_amount}
              onChange={e => setForm({ ...form, target_amount: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="date"
              value={form.target_date}
              onChange={e => setForm({ ...form, target_date: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="number"
              placeholder="Monthly Contribution (₹)"
              value={form.monthly_contribution}
              onChange={e => setForm({ ...form, monthly_contribution: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              {editing ? 'Update Goal' : '+ Create Goal'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {goals.length === 0 ? (
        <p className="text-slate-500 text-center py-8 glass-card">No goals yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-slate-200 capitalize">{goal.goal_type}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {goal.status}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target</span>
                  <span className="text-slate-200 font-medium">₹{parseFloat(goal.target_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monthly</span>
                  <span className="text-slate-200 font-medium">₹{parseFloat(goal.monthly_contribution || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date</span>
                  <span className="text-slate-200 font-medium">{new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => handleEdit(goal)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
