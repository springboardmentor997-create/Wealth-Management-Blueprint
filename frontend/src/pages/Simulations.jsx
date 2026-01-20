import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Simulations() {
  const [simulations, setSimulations] = useState([])
  const [goals, setGoals] = useState([])
  const [form, setForm] = useState({ scenario_name: '', goal_id: '' })
  const [simulationParams, setSimulationParams] = useState({
    initial_amount: '10000',
    monthly_contribution: '5000',
    rate: '12',
    years: '10',
    inflation_rate: '6'
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [simRes, goalRes] = await Promise.all([
        axios.get('http://localhost:8000/simulations/'),
        axios.get('http://localhost:8000/goals/')
      ])
      setSimulations(simRes.data)
      setGoals(goalRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGoalSelect = (e) => {
    const gId = e.target.value
    if (!gId) {
      setForm({ ...form, goal_id: '' })
      return
    }

    const goal = goals.find(g => g.id.toString() === gId)
    if (goal) {
      const yearsLeft = Math.max(1, new Date(goal.target_date).getFullYear() - new Date().getFullYear())
      setSimulationParams({
        ...simulationParams,
        monthly_contribution: goal.monthly_contribution,
        years: yearsLeft
      })
      setForm({
        ...form,
        goal_id: gId,
        scenario_name: `Plan for ${goal.goal_type} (${new Date(goal.target_date).getFullYear()})`
      })
    } else {
      setForm({ ...form, goal_id: gId })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const payload = {
        scenario_name: form.scenario_name,
        goal_id: form.goal_id ? parseInt(form.goal_id) : null,
        assumptions: {
          initial_amount: simulationParams.initial_amount,
          monthly_contribution: simulationParams.monthly_contribution,
          rate: simulationParams.rate,
          years: simulationParams.years,
          inflation_rate: simulationParams.inflation_rate
        }
      }
      const res = await axios.post('http://localhost:8000/simulations/', payload)
      setResults(res.data.results)
      await loadData()
    } catch (err) {
      console.error('Error running simulation:', err)
      setError(err.response?.data?.detail || 'Error running simulation')
    }
  }

  // ... handleDelete remains same ...

  if (loading) return <div className="animate-pulse p-8"><div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div><div className="h-64 bg-gray-200 rounded"></div></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">🎲 Simulations</h1>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-200">New Scenario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Scenario Name</label>
                <input
                  type="text"
                  placeholder="e.g., Optimistic Growth"
                  value={form.scenario_name}
                  onChange={e => setForm({ ...form, scenario_name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Link to Goal (Optional)</label>
                <select
                  value={form.goal_id}
                  onChange={handleGoalSelect}
                  className="form-input"
                >
                  <option value="">-- No Goal Selected --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.goal_type.toUpperCase()} - Target: ₹{g.target_amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Initial Amount (₹)</label>
                  <input
                    type="number"
                    value={simulationParams.initial_amount}
                    onChange={e => setSimulationParams({ ...simulationParams, initial_amount: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Monthly (₹)</label>
                  <input
                    type="number"
                    value={simulationParams.monthly_contribution}
                    onChange={e => setSimulationParams({ ...simulationParams, monthly_contribution: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-400">Exp. Return Rate</label>
                  <span className="text-sm font-bold text-indigo-400">{simulationParams.rate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={simulationParams.rate}
                  onChange={e => setSimulationParams({ ...simulationParams, rate: e.target.value })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-400">
                    Inflation Rate
                    <span className="ml-2 text-xs text-slate-500 font-normal">(Real Return: {(parseFloat(simulationParams.rate) - parseFloat(simulationParams.inflation_rate)).toFixed(1)}%)</span>
                  </label>
                  <span className="text-sm font-bold text-rose-400">{simulationParams.inflation_rate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={simulationParams.inflation_rate}
                  onChange={e => setSimulationParams({ ...simulationParams, inflation_rate: e.target.value })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-400">Time Horizon (Years)</label>
                  <span className="text-sm font-bold text-emerald-400">{simulationParams.years} yrs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={simulationParams.years}
                  onChange={e => setSimulationParams({ ...simulationParams, years: e.target.value })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3 font-bold text-lg shadow-xl shadow-indigo-600/20">
                Run Simulation 🚀
              </button>
            </div>
          </form>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {results ? (
            <div className="glass-card p-6 h-full">
              <h2 className="text-xl font-bold mb-4 text-slate-200">📊 Projection Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-600 font-semibold uppercase">Final Balance</p>
                  <p className="text-xl font-bold text-indigo-900">₹{Math.round(results.summary?.final_balance || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-xs text-emerald-600 font-semibold uppercase">Total Contributed</p>
                  <p className="text-xl font-bold text-emerald-900">₹{Math.round(results.summary?.total_contributions || 0).toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs text-amber-600 font-semibold uppercase">Total Interest</p>
                  <p className="text-xl font-bold text-amber-900">₹{Math.round(results.summary?.total_interest || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Simple Bar Chart Visualization Placeholder */}
              <div className="h-64 flex items-end justify-between gap-1 mt-8 border-b border-l border-slate-200 p-2">
                {results.yearly_breakdown?.map((yr, i) => (
                  <div key={i} className="w-full bg-indigo-200 hover:bg-indigo-300 transition relative group rounded-t-sm" style={{ height: `${(yr.balance / results.summary.final_balance) * 100}%` }}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-1 rounded whitespace-nowrap z-10">
                      Year {yr.year}: ₹{Math.round(yr.balance).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">Projection over {results.parameters?.years} years</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center glass-card border-dashed border-slate-700/50 text-slate-400">
              Select a goal or enter details to see projections
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8 text-slate-200">Past Simulations</h2>
      {simulations.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No simulations yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulations.map(sim => (
            <div key={sim.id} className="glass-card p-4">
              <h3 className="font-bold text-lg text-slate-200">{sim.scenario_name}</h3>
              <p className="text-sm text-slate-400">Goal ID: {sim.goal_id || 'N/A'}</p>
              <p className="text-sm text-slate-500">Created: {new Date(sim.created_at).toLocaleDateString()}</p>
              <details className="mt-2 text-slate-300">
                <summary className="cursor-pointer text-indigo-400">View Assumptions</summary>
                <pre className="bg-slate-900/50 p-2 rounded mt-2 text-xs overflow-auto border border-slate-700">{JSON.stringify(sim.assumptions, null, 2)}</pre>
              </details>
              <details className="mt-2 text-slate-300">
                <summary className="cursor-pointer text-indigo-400">View Results</summary>
                <pre className="bg-slate-900/50 p-2 rounded mt-2 text-xs overflow-auto border border-slate-700">{JSON.stringify(sim.results, null, 2)}</pre>
              </details>
              <button
                onClick={() => handleDelete(sim.id)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 w-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
