import React, { useState, useEffect } from 'react'
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem, getWatchlistStats } from '../api/watchlistApi'

export default function Watchlist() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    symbol: '',
    asset_type: 'stock',
    name: '',
    current_price: '',
    target_price: '',
    notes: '',
    exchange: '',
    sector: ''
  })

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    setLoading(true)
    setError(null)
    try {
      const [itemsRes, statsRes] = await Promise.all([
        getWatchlist(),
        getWatchlistStats()
      ])
      setItems(itemsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load watchlist')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()

    if (!form.symbol || !form.name || !form.current_price) {
      setError('Please fill in required fields')
      return
    }

    try {
      await addToWatchlist({
        ...form,
        current_price: parseFloat(form.current_price),
        target_price: form.target_price ? parseFloat(form.target_price) : null
      })

      setForm({
        symbol: '',
        asset_type: 'stock',
        name: '',
        current_price: '',
        target_price: '',
        notes: '',
        exchange: '',
        sector: ''
      })
      setShowAddForm(false)
      setError(null)
      await loadWatchlist()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add to watchlist')
    }
  }

  const handleRemove = async (id, symbol) => {
    if (window.confirm(`Remove ${symbol} from watchlist?`)) {
      try {
        await removeFromWatchlist(id)
        await loadWatchlist()
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to remove item')
      }
    }
  }

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) return <p className="text-lg">Loading watchlist...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">📊 My Watchlist</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {showAddForm ? 'Cancel' : '+ Add Stock'}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-5 gap-4 mb-6 animate-fade-in-up animate-delay-100">
          <div className="glass-card p-4">
            <p className="text-gray-600 text-sm">Total Items</p>
            <p className="text-2xl font-bold">{stats.total_items}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">Gainers</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.gainers}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">Losers</p>
            <p className="text-2xl font-bold text-rose-400">{stats.losers}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">Avg Change</p>
            <p className={`text-2xl font-bold ${getPriceChangeColor(stats.avg_price_change)}`}>
              ₹{stats.avg_price_change.toFixed(2)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-slate-200">₹{stats.total_value.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add Stock Form */}
      {showAddForm && (
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h2 className="text-xl font-bold mb-4 text-slate-200">Add to Watchlist</h2>
          <form onSubmit={handleAddStock} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Symbol *</label>
              <input
                type="text"
                placeholder="e.g., AAPL, RELIANCE.NS"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Company Name *</label>
              <input
                type="text"
                placeholder="e.g., Apple Inc, Reliance Industries"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Asset Type</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                className="form-input"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="etf">ETF</option>
                <option value="mutual_fund">Mutual Fund</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Exchange</label>
              <input
                type="text"
                placeholder="e.g., NASDAQ, NSE, BSE"
                value={form.exchange}
                onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Current Price *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.current_price}
                onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={form.target_price}
                onChange={(e) => setForm({ ...form, target_price: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Sector</label>
              <input
                type="text"
                placeholder="e.g., Technology, Finance"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Notes</label>
              <textarea
                placeholder="Your personal notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="form-input"
                rows="2"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add to Watchlist
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-700 text-slate-200 px-4 py-2 rounded hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Watchlist Items */}
      {items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400 text-lg">No items in your watchlist yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
          >
            Add Your First Stock
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up animate-delay-200">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-200">{item.symbol}</h3>
                  <p className="text-slate-400 text-sm">{item.name}</p>
                  {item.sector && <p className="text-xs text-slate-500">{item.sector}</p>}
                </div>
                <button
                  onClick={() => handleRemove(item.id, item.symbol)}
                  className="text-rose-400 hover:text-rose-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-slate-500 text-xs">Current Price</p>
                  <p className="text-lg font-semibold text-slate-200">₹{item.current_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Change</p>
                  <p className={`text-lg font-semibold ${getPriceChangeColor(item.price_change)}`}>
                    {item.price_change > 0 ? '+' : ''}{item.price_change.toFixed(2)} ({item.price_change_percent}%)
                  </p>
                </div>
              </div>

              {item.target_price && (
                <div className="bg-blue-50 p-2 rounded mb-3">
                  <p className="text-xs text-gray-600">Target Price</p>
                  <p className="text-sm font-semibold">₹{item.target_price.toFixed(2)}</p>
                </div>
              )}

              {item.notes && (
                <div className="bg-gray-50 p-2 rounded mb-3">
                  <p className="text-xs text-gray-600">Notes</p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}

              <p className="text-xs text-slate-500">
                Added: {new Date(item.added_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
