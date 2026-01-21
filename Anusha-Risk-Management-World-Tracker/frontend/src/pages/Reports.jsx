import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Reports() {
  const [loading, setLoading] = useState({
    portfolioPdf: false,
    portfolioCsv: false,
    goalsPdf: false,
  })

  const downloadReport = async (type, format) => {
    const key = `${type}${format.charAt(0).toUpperCase() + format.slice(1)}`
    setLoading({ ...loading, [key]: true })

    try {
      const response = await axios.get(`${API_URL}/api/reports/${type}/${format}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_report.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Failed to download ${type} ${format} report:`, error)
      alert(`Failed to download ${type} ${format} report`)
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="mt-2 text-gray-600">
          Download your financial reports in PDF or CSV format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Reports */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-4">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Portfolio Report</h2>
              <p className="text-sm text-gray-600">Your investment portfolio summary</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => downloadReport('portfolio', 'pdf')}
              disabled={loading.portfolioPdf}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading.portfolioPdf ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  📄 Download PDF
                </>
              )}
            </button>
            <button
              onClick={() => downloadReport('portfolio', 'csv')}
              disabled={loading.portfolioCsv}
              className="w-full btn-secondary flex items-center justify-center"
            >
              {loading.portfolioCsv ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  📊 Download CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Goals Reports */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mr-4">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Goals Report</h2>
              <p className="text-sm text-gray-600">Your financial goals summary</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => downloadReport('goals', 'pdf')}
              disabled={loading.goalsPdf}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading.goalsPdf ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  📄 Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Report Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <div>
              <p className="font-semibold text-gray-900">Portfolio Report</p>
              <p>Includes all your investments with current values, cost basis, and gain/loss calculations</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <div>
              <p className="font-semibold text-gray-900">Goals Report</p>
              <p>Summary of all your financial goals with target amounts, dates, and contribution details</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <div>
              <p className="font-semibold text-gray-900">Export Formats</p>
              <p>PDF format for easy viewing and printing. CSV format for data analysis in Excel or Google Sheets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports

