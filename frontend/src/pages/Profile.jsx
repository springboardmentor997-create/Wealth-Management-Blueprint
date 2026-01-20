import React, { useState } from 'react'
import { useAuth } from '../components/AuthContext'
import RiskAssessmentQuiz from '../components/RiskAssessmentQuiz'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', risk_profile: user?.risk_profile || 'moderate' })
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      // use apiClient to call backend
      // user_router.py expects { name, risk_profile } in body
      // and user_id in path
      const { default: apiClient } = await import('../api/client')

      const payload = {
        name: profile.name,
        risk_profile: profile.risk_profile
      }

      await apiClient.put(`/users/${user.id}`, payload)

      // Update local context
      updateUser(payload)

      setMessage('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage('Failed to update profile. ' + (err.response?.data?.detail || ''))
    }
    setLoading(false)
  }

  // Handle quiz specific update separately or reuse handleSubmit logic?
  // Let's reuse the update logic but for risk_profile only
  const handleQuizComplete = async (result) => {
    const newRisk = result.risk_profile
    setProfile(prev => ({ ...prev, risk_profile: newRisk }))
    setShowQuiz(false)

    // Auto-save the new risk profile provided by quiz
    try {
      const { default: apiClient } = await import('../api/client')
      await apiClient.put(`/users/${user.id}`, { risk_profile: newRisk })
      updateUser({ risk_profile: newRisk })
      setMessage(`Risk Assessment complete! Profile updated to ${newRisk}.`)
    } catch (err) {
      console.error("Failed to auto-save quiz result", err)
      setMessage("Quiz complete, but failed to save to server.")
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">👤 Profile Settings</h1>

      {message && <div className={`p-4 rounded-lg mb-6 shadow-sm border ${message.includes('Failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{message}</div>}

      {showQuiz ? (
        <RiskAssessmentQuiz onComplete={handleQuizComplete} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Profile' : 'Profile Information'}</h2>

            {!editing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="text-lg font-semibold">{profile.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-lg font-semibold">{profile.email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Risk Profile</p>
                  <p className="text-lg font-semibold capitalize">{profile.risk_profile}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Account Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
                <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4">
                  Edit Profile
                </button>
                <button onClick={() => setShowQuiz(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4 ml-2">
                  Update Risk Assessment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Email</label>
                  <input type="email" value={profile.email} disabled className="w-full p-2 border rounded bg-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Risk Profile</label>
                  <select value={profile.risk_profile} onChange={e => setProfile({ ...profile, risk_profile: e.target.value })} className="w-full p-2 border rounded">
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Risk Profile Guide</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-blue-700">Conservative</p>
                <p className="text-gray-700">Low volatility, steady returns, capital preservation focus</p>
              </div>
              <div>
                <p className="font-semibold text-blue-700">Moderate</p>
                <p className="text-gray-700">Balanced growth and stability, mixed asset allocation</p>
              </div>
              <div>
                <p className="font-semibold text-blue-700">Aggressive</p>
                <p className="text-gray-700">High growth potential, higher volatility, long-term focus</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
