import React, { useState } from 'react'
import axios from 'axios'

export default function Market() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockData, setStockData] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const [stock, rec] = await Promise.all([
        axios.get(`http://localhost:8000/market/stock/${searchQuery.toUpperCase()}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8000/market/recommend/${searchQuery.toUpperCase()}`).catch(() => ({ data: null }))
      ])
      setStockData(stock.data)
      setRecommendation(rec.data)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🔍 Market & Recommendations</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Search Stock</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., TCS, INFY)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {stockData && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">{stockData.symbol}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Current Price</p>
              <p className="text-2xl font-bold">₹{stockData.price || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold">{stockData.market_cap || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">PE Ratio</p>
              <p className="text-2xl font-bold">{stockData.pe_ratio || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Dividend Yield</p>
              <p className="text-2xl font-bold">{stockData.dividend_yield || 'N/A'}%</p>
            </div>
          </div>
        </div>
      )}

      {recommendation && (
        <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">💡 Recommendation</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 font-semibold">Action</p>
              <p className="text-lg">{recommendation.recommendation || 'Hold'}</p>
            </div>
            {recommendation.suggested_allocation && (
              <div>
                <p className="text-gray-600 font-semibold">Suggested Allocation</p>
                <div className="mt-2 space-y-1">
                  {Object.entries(recommendation.suggested_allocation).map(([key, val]) => (
                    <p key={key} className="text-sm">{key}: <span className="font-bold">{val}%</span></p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!stockData && !recommendation && searchQuery && (
        <p className="text-gray-500 text-center py-8">No data found for {searchQuery}</p>
      )}
    </div>
  )
}
