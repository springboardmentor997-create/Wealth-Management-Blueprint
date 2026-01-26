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
      <h1 className="text-3xl font-bold mb-6 text-foreground">🔍 Market & Recommendations</h1>

      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">Search Stock</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., TCS, INFY, NIFTY)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 bg-secondary border border-white/10 rounded-lg text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
          />
          <button onClick={handleSearch} disabled={loading} className="btn-premium px-6 py-2 rounded-lg text-white disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {stockData && (
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-foreground">{stockData.symbol}</h2>
            <div className="text-sm bg-white/5 px-3 py-1 rounded-full text-muted-foreground">{stockData.name}</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-secondary/50 rounded-xl border border-white/5">
              <p className="text-muted-foreground text-sm mb-1">Current Price</p>
              <p className="text-2xl font-bold text-foreground">₹{stockData.price ? stockData.price.toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl border border-white/5">
              <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
              <p className="text-xl font-bold text-foreground">{stockData.market_cap || 'N/A'}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl border border-white/5">
              <p className="text-muted-foreground text-sm mb-1">PE Ratio</p>
              <p className="text-xl font-bold text-foreground">{stockData.pe_ratio || 'N/A'}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl border border-white/5">
              <p className="text-muted-foreground text-sm mb-1">Dividend Yield</p>
              <p className="text-xl font-bold text-foreground">{stockData.dividend_yield ? stockData.dividend_yield + '%' : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {recommendation && (
        <div className="glass-card p-6 border-l-4 border-l-green-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
          <h2 className="text-xl font-bold mb-6 text-foreground relative z-10">💡 Recommendation</h2>
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div>
              <p className="text-muted-foreground font-bold uppercase text-xs mb-2">Action</p>
              <p className={`text-3xl font-bold ${recommendation.recommendation === 'BUY' ? 'text-green-400' : recommendation.recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'}`}>
                {recommendation.recommendation || 'Hold'}
              </p>
            </div>
            {recommendation.suggested_allocation && (
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs mb-3">Suggested Allocation</p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(recommendation.suggested_allocation).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded">
                      <span className="capitalize text-sm text-gray-300">{key.replace('_', ' ')}</span>
                      <span className="font-bold text-foreground">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!stockData && !recommendation && searchQuery && !loading && (
        <p className="text-muted-foreground text-center py-12 bg-secondary/20 rounded-xl border border-white/5">No data found for "{searchQuery}"</p>
      )}
    </div>
  )
}
