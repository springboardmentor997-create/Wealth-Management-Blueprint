import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'
import { SkeletonLoader } from '../components/Skeleton'

export default function Portfolio() {
  const [investments, setInvestments] = useState([])
  const [form, setForm] = useState({ asset_type: 'stock', symbol: '', units: '', avg_buy_price: '', cost_basis: '', current_value: '', last_price: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const { addToast } = useToast()

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      setErrors({})
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:8000/portfolio/investments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInvestments(res.data)
    } catch (err) {
      console.error('Error loading investments:', err)
      addToast('Failed to load investments', 'error')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.symbol.trim()) newErrors.symbol = 'Symbol is required'
    if (!form.units || parseFloat(form.units) <= 0) newErrors.units = 'Units must be greater than 0'
    if (!form.avg_buy_price || parseFloat(form.avg_buy_price) < 0) newErrors.avg_buy_price = 'Average buy price must be >= 0'
    if (!form.cost_basis || parseFloat(form.cost_basis) < 0) newErrors.cost_basis = 'Cost basis must be >= 0'
    if (!form.current_value || parseFloat(form.current_value) < 0) newErrors.current_value = 'Current value must be >= 0'
    if (!form.last_price || parseFloat(form.last_price) < 0) newErrors.last_price = 'Last price must be >= 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      addToast('Please fix the errors in the form', 'warning')
      return
    }
    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      // Auto-calculate derived fields
      const units = parseFloat(form.units)
      const price = parseFloat(form.avg_buy_price)
      const cost = units * price

      const payload = {
        ...form,
        cost_basis: cost,
        current_value: cost, // Defaults to cost basis initially
        last_price: price // Defaults to buy price initially
      }

      await axios.post('http://localhost:8000/portfolio/investments', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm({ asset_type: 'stock', symbol: '', units: '', avg_buy_price: '', cost_basis: '', current_value: '', last_price: '' })
      setErrors({})
      await loadInvestments()
      addToast('Investment added successfully!', 'success')
      // Trigger a soft update after adding?
    } catch (err) {
      console.error('Error adding investment:', err)
      addToast(err.response?.data?.detail || 'Error adding investment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this investment?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8000/portfolio/investments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await loadInvestments()
        addToast('Investment deleted successfully!', 'success')
      } catch (err) {
        console.error('Error deleting investment:', err)
        addToast(err.response?.data?.detail || 'Error deleting investment', 'error')
      }
    }
  }

  const totalValue = investments.reduce((sum, inv) => sum + (parseFloat(inv.current_value) || 0), 0)
  const totalCost = investments.reduce((sum, inv) => sum + (parseFloat(inv.cost_basis) || 0), 0)
  const totalReturn = totalValue - totalCost
  const returnPercentage = totalCost > 0 ? ((totalReturn / totalCost) * 100).toFixed(2) : 0

  if (loading) return <div><h1 className="text-3xl font-bold mb-6">📈 Portfolio</h1><SkeletonLoader rows={8} columns={7} /></div>

  const handleSync = async () => {
    try {
      addToast('Syncing market prices...', 'info')
      await axios.post('http://localhost:8000/dashboard/sync-market')
      setTimeout(() => {
        loadInvestments()
        addToast('Market prices updated', 'success')
      }, 2000) // Wait for task to likely complete (for demo)
    } catch (err) {
      console.error('Sync failed:', err)
      addToast('Failed to trigger sync', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">📈 Portfolio</h1>
        <button
          onClick={handleSync}
          className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition font-medium border border-indigo-500/20"
        >
          <span className="animate-spin-slow">♻️</span> Sync Prices
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 animate-zoom-in animate-delay-100">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-bold text-slate-200 mt-1">₹{totalValue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 animate-zoom-in animate-delay-200">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Cost</p>
          <p className="text-3xl font-bold text-slate-300 mt-1">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 animate-zoom-in animate-delay-300">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Return</p>
          <p className={`text-3xl font-bold mt-1 ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalReturn >= 0 ? '+' : ''}₹{totalReturn.toLocaleString()} <span className="text-lg opacity-80">({returnPercentage}%)</span>
          </p>
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in-up animate-delay-300">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <span>➕</span> Add Investment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Asset Type</label>
              <select
                value={form.asset_type}
                onChange={e => { setForm({ ...form, asset_type: e.target.value }); setErrors({ ...errors, asset_type: '' }) }}
                className="form-input"
              >
                <option value="stock">Stock</option>
                <option value="etf">ETF</option>
                <option value="mutual_fund">Mutual Fund</option>
                <option value="bond">Bond</option>
                <option value="cash">Cash</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>

            <div className={`${errors.symbol ? 'form-field-error' : ''}`}>
              <label className="block text-sm font-medium text-slate-400 mb-2">Symbol</label>
              <input
                type="text"
                placeholder="e.g., AAPL, RELIANCE"
                value={form.symbol}
                onChange={e => { setForm({ ...form, symbol: e.target.value.toUpperCase() }); setErrors({ ...errors, symbol: '' }) }}
                className="form-input"
                required
              />
              {errors.symbol && <p className="text-rose-400 text-xs mt-1">{errors.symbol}</p>}
            </div>

            <div className={`${errors.units ? 'form-field-error' : ''}`}>
              <label className="block text-sm font-medium text-slate-400 mb-2">Units</label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={form.units}
                onChange={e => { setForm({ ...form, units: e.target.value }); setErrors({ ...errors, units: '' }) }}
                className="form-input"
                required
              />
              {errors.units && <p className="text-rose-400 text-xs mt-1">{errors.units}</p>}
            </div>

            <div className={`${errors.avg_buy_price ? 'form-field-error' : ''}`}>
              <label className="block text-sm font-medium text-slate-400 mb-2">Avg Buy Price (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.avg_buy_price}
                onChange={e => { setForm({ ...form, avg_buy_price: e.target.value }); setErrors({ ...errors, avg_buy_price: '' }) }}
                className="form-input"
                required
              />
              {errors.avg_buy_price && <p className="text-rose-400 text-xs mt-1">{errors.avg_buy_price}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
            <span className="text-slate-400 font-medium">Estimated Cost Basis</span>
            <span className="text-xl font-bold text-slate-200">
              ₹{((parseFloat(form.units) || 0) * (parseFloat(form.avg_buy_price) || 0)).toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full md:w-auto"
          >
            {submitting ? '⏳ Adding...' : 'Add Investment'}
          </button>
        </form>
      </div>

      {investments.length === 0 ? (
        <p className="text-slate-500 text-center py-12 glass-card animate-fade-in-up animate-delay-400">
          No investments yet. Add your first asset above! 🚀
        </p>
      ) : (
        <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-400">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="p-4 text-left font-medium">Symbol</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-right font-medium">Units</th>
                  <th className="p-4 text-right font-medium">Avg Price</th>
                  <th className="p-4 text-right font-medium">Current Value</th>
                  <th className="p-4 text-right font-medium">Gain/Loss</th>
                  <th className="p-4 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {investments.map(inv => {
                  const gain = parseFloat(inv.current_value || 0) - parseFloat(inv.cost_basis || 0)
                  const gainPercent = parseFloat(inv.cost_basis || 0) > 0 ? ((gain / parseFloat(inv.cost_basis)) * 100).toFixed(2) : 0
                  return (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-bold text-slate-200">{inv.symbol}</td>
                      <td className="p-4 capitalize text-slate-400">{inv.asset_type}</td>
                      <td className="p-4 text-right text-slate-300">{parseFloat(inv.units || 0).toFixed(2)}</td>
                      <td className="p-4 text-right text-slate-300">₹{parseFloat(inv.avg_buy_price || 0).toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold text-slate-200">₹{parseFloat(inv.current_value || 0).toLocaleString()}</td>
                      <td className={`p-4 text-right font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} <span className="text-xs opacity-70 block sm:inline">({gainPercent}%)</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
