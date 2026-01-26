
import React, { useState, useEffect, useRef } from 'react'
import { getWatchlist, addToWatchlist, removeFromWatchlist, getWatchlistStats } from '../api/watchlistApi'
import api from '../api/client' // Direct access for custom endpoints
import WatchlistTable from '../components/WatchlistTable'
import { Plus, Search, RefreshCw, Loader2, LayoutGrid, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Watchlist() {
  const [items, setItems] = useState([])
  const [livePrices, setLivePrices] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid' (grid logic kept if needed)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)

  // Polling Interval
  const POLL_INTERVAL = 5000;
  const pollTimer = useRef(null)

  const [form, setForm] = useState({
    symbol: '',
    asset_type: 'stock',
    name: '',
    current_price: '',
    target_price: '',
    notes: ''
  })

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist()
    return () => clearInterval(pollTimer.current)
  }, [])

  // Setup polling when items change
  useEffect(() => {
    if (items.length > 0) {
      // Start polling
      startPolling();
    } else {
      clearInterval(pollTimer.current);
    }
  }, [items])

  const startPolling = () => {
    clearInterval(pollTimer.current);
    pollTimer.current = setInterval(fetchLivePrices, POLL_INTERVAL);
  }

  const fetchLivePrices = async () => {
    if (items.length === 0) return;
    try {
      const symbols = items.map(i => i.symbol);
      const res = await api.post('/market/quotes', { symbols });
      setLivePrices(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Failed to fetch live prices", err);
    }
  }

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

      // Initial fetch of prices
      if (itemsRes.data.length > 0) {
        const symbols = itemsRes.data.map(i => i.symbol);
        const res = await api.post('/market/quotes', { symbols });
        setLivePrices(res.data);
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLivePrices();
    await loadWatchlist(); // Also reload list to sync adds/removes
    setRefreshing(false);
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
        notes: ''
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
        // Optimistic update
        setItems(items.filter(i => i.id !== id))
        await loadWatchlist() // Sync fully
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to remove item')
      }
    }
  }

  if (loading && items.length === 0) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <span className="bg-primary/20 p-2 rounded-lg text-primary text-2xl">📈</span>
            Market Watchlist
          </h1>
          <p className="text-muted-foreground mt-1">Real-time tracking of your favorite assets</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Market
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            title="Refresh Prices"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-premium px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add New Asset</h2>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleAddStock} className="grid md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Symbol</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="AAPL, TCS.NS..."
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-sm focus:border-primary outline-none"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Buy Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.current_price}
                  onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-sm focus:border-primary outline-none"
                  required
                />
              </div>
              <div className="col-span-4 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold shadow-glow-primary">Add to Watchlist</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="glass-card rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-6">Start tracking stocks, ETFs, and cryptos by adding them to your list.</p>
            <button onClick={() => setShowAddForm(true)} className="btn-premium px-6 py-2 rounded-full text-sm">Create Watchlist</button>
          </div>
        ) : (
          <WatchlistTable items={items} onRemove={handleRemove} prices={livePrices} />
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Live data provided by Yahoo Finance & Alpha Vantage. Market data may be delayed by 15 minutes.
      </div>
    </div>
  )
}

