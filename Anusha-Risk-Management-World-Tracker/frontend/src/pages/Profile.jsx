import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Profile() {
  const { user: authUser, refreshToken } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    risk_profile: 'moderate',
    kyc_status: 'unverified',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`)
      setUser(response.data)
      setFormData({
        name: response.data.name,
        risk_profile: response.data.risk_profile,
        kyc_status: response.data.kyc_status,
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      if (error.response?.status === 401) {
        try {
          await refreshToken()
          fetchProfile()
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }
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
    setMessage('')

    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, formData)
      setUser(response.data)
      setEditing(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update profile. Please try again.')
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const riskProfileLabels = {
    conservative: 'Conservative',
    moderate: 'Moderate',
    aggressive: 'Aggressive',
  }

  const kycStatusLabels = {
    unverified: 'Unverified',
    verified: 'Verified',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your profile and risk preferences
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded ${
            message.includes('success')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="card">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="input-modern"
                required
              />
            </div>

            <div>
              <label htmlFor="risk_profile" className="block text-sm font-medium text-gray-700 mb-2">
                Risk Profile
              </label>
              <select
                name="risk_profile"
                id="risk_profile"
                value={formData.risk_profile}
                onChange={handleChange}
                className="input-modern"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Your risk profile helps us provide personalized investment recommendations.
              </p>
            </div>

            <div>
              <label htmlFor="kyc_status" className="block text-sm font-medium text-gray-700">
                KYC Status
              </label>
              <select
                name="kyc_status"
                id="kyc_status"
                value={formData.kyc_status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    name: user.name,
                    risk_profile: user.risk_profile,
                    kyc_status: user.kyc_status,
                  })
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Risk Profile</label>
              <p className="mt-1 text-sm text-gray-900">
                {riskProfileLabels[user?.risk_profile] || user?.risk_profile}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">KYC Status</label>
              <p className="mt-1 text-sm text-gray-900">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.kyc_status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {kycStatusLabels[user?.kyc_status] || user?.kyc_status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

