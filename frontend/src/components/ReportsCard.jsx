import React, { useState } from 'react'
import axios from 'axios'
import { useToast } from './Toast'

const ReportsCard = () => {
  const [loading, setLoading] = useState(null)
  const [portfolioFormat, setPortfolioFormat] = useState('csv')
  const [goalsFormat, setGoalsFormat] = useState('csv')
  const { addToast } = useToast()

  const handleDownload = async (reportType, format) => {
    try {
      setLoading(reportType)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:8000/reports/${reportType}/export?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}.${format === 'pdf' ? 'pdf' : 'csv'}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      addToast(`${reportType} report downloaded successfully!`, 'success')
    } catch (error) {
      console.error('Download error:', error)
      addToast('Failed to download report', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-6">📊 Reports & Exports</h2>

      <div className="space-y-4">
        {/* Portfolio Export */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Portfolio Report</h3>
          <div className="flex items-center gap-3">
            <select
              value={portfolioFormat}
              onChange={(e) => setPortfolioFormat(e.target.value)}
              className="p-2 border rounded text-sm"
              disabled={loading === 'portfolio'}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={() => handleDownload('portfolio', portfolioFormat)}
              disabled={loading === 'portfolio'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium transition"
            >
              {loading === 'portfolio' ? '⏳ Downloading...' : '⬇ Download'}
            </button>
          </div>
        </div>

        {/* Goals Export */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Goals Report</h3>
          <div className="flex items-center gap-3">
            <select
              value={goalsFormat}
              onChange={(e) => setGoalsFormat(e.target.value)}
              className="p-2 border rounded text-sm"
              disabled={loading === 'goals'}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={() => handleDownload('goals', goalsFormat)}
              disabled={loading === 'goals'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium transition"
            >
              {loading === 'goals' ? '⏳ Downloading...' : '⬇ Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsCard

