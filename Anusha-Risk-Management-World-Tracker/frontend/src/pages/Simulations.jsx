import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Simulations() {
  const [goals, setGoals] = useState([])
  const [simulations, setSimulations] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    goal_id: '',
    scenario_name: '',
    annual_return_rate: 7.0,
    inflation_rate: 3.0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, simsRes] = await Promise.all([
        axios.get(`${API_URL}/api/goals`),
        axios.get(`${API_URL}/api/simulations`),
      ])
      setGoals(goalsRes.data)
      setSimulations(simsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedGoal) {
        await axios.post(`${API_URL}/api/simulations/goal/${selectedGoal}/simulate`, {
          annual_return_rate: parseFloat(formData.annual_return_rate),
          inflation_rate: parseFloat(formData.inflation_rate),
        })
      } else {
        await axios.post(`${API_URL}/api/simulations`, {
          goal_id: formData.goal_id || null,
          scenario_name: formData.scenario_name,
          assumptions: {
            annual_return_rate: parseFloat(formData.annual_return_rate),
            inflation_rate: parseFloat(formData.inflation_rate),
          },
        })
      }
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create simulation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Simulations
          </h1>
          <p className="mt-2 text-gray-600">
            Run what-if scenarios and goal projections
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Simulation'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create Simulation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal (Optional)</label>
              <select
                value={formData.goal_id}
                onChange={(e) => {
                  setSelectedGoal(e.target.value)
                  setFormData({ ...formData, goal_id: e.target.value })
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Standalone Simulation</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.goal_type} - ${parseFloat(goal.target_amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {!selectedGoal && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Scenario Name</label>
                <input
                  type="text"
                  value={formData.scenario_name}
                  onChange={(e) => setFormData({ ...formData, scenario_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!selectedGoal}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Annual Return Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.annual_return_rate}
                  onChange={(e) => setFormData({ ...formData, annual_return_rate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inflation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.inflation_rate}
                  onChange={(e) => setFormData({ ...formData, inflation_rate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Run Simulation
            </button>
          </form>
        </div>
      )}

      {simulations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
            <span className="text-4xl">🔮</span>
          </div>
          <p className="text-gray-500 text-lg">No simulations yet. Create your first simulation!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {simulations.map((sim) => (
            <div key={sim.id} className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {sim.scenario_name}
              </h3>
              
              {sim.results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Projected Amount</p>
                      <p className="text-lg font-semibold">
                        ${sim.results.projected_amount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Target Amount</p>
                      <p className="text-lg font-semibold">
                        ${sim.results.target_amount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sim.results.is_on_track
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {sim.results.is_on_track ? 'On Track' : 'Needs Adjustment'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Months Remaining</p>
                      <p className="text-lg font-semibold">{sim.results.months_remaining || 'N/A'}</p>
                    </div>
                  </div>

                  {sim.results.shortfall > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Shortfall:</strong> ${sim.results.shortfall.toLocaleString()}
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        <strong>Required Monthly Contribution:</strong> ${sim.results.required_monthly_contribution?.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {sim.assumptions && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Assumptions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Annual Return Rate: {sim.assumptions.annual_return_rate}%</li>
                        <li>Inflation Rate: {sim.assumptions.inflation_rate}%</li>
                        {sim.assumptions.monthly_contribution && (
                          <li>Monthly Contribution: ${sim.assumptions.monthly_contribution.toLocaleString()}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Simulations

