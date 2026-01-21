import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Portfolio() {
  const [investments, setInvestments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [investmentForm, setInvestmentForm] = useState({
    asset_type: 'stock',
    symbol: '',
    units: '',
    avg_buy_price: '',
    cost_basis: '',
  })
  const [transactionForm, setTransactionForm] = useState({
    symbol: '',
    type: 'buy',
    quantity: '',
    price: '',
    fees: '0',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [investmentsRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/investments`),
        axios.get(`${API_URL}/api/transactions`),
      ])
      setInvestments(investmentsRes.data)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/investments`, {
        ...investmentForm,
        units: parseFloat(investmentForm.units),
        avg_buy_price: parseFloat(investmentForm.avg_buy_price),
        cost_basis: parseFloat(investmentForm.cost_basis),
      })
      setShowInvestmentForm(false)
      setInvestmentForm({
        asset_type: 'stock',
        symbol: '',
        units: '',
        avg_buy_price: '',
        cost_basis: '',
      })
      fetchData()
    } catch (error) {
      console.error('Failed to create investment:', error)
    }
  }

  const handleTransactionSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/transactions`, {
        ...transactionForm,
        quantity: parseFloat(transactionForm.quantity),
        price: parseFloat(transactionForm.price),
        fees: parseFloat(transactionForm.fees),
      })
      setShowTransactionForm(false)
      setTransactionForm({
        symbol: '',
        type: 'buy',
        quantity: '',
        price: '',
        fees: '0',
      })
      fetchData()
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalValue = investments.reduce(
    (sum, inv) => sum + (parseFloat(inv.current_value) || parseFloat(inv.cost_basis) || 0),
    0
  )
  const totalCost = investments.reduce(
    (sum, inv) => sum + (parseFloat(inv.cost_basis) || 0),
    0
  )
  const totalGain = totalValue - totalCost

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Portfolio
        </h1>
        <p className="mt-2 text-gray-600">
          Track your investments and transactions
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="stat-card card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold mt-2">
                ${totalValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalCost.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Gain/Loss</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  totalGain >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalGain >= 0 ? '↑' : '↓'} ${Math.abs(totalGain).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              totalGain >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
              <span className="text-2xl">{totalGain >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowInvestmentForm(!showInvestmentForm)}
          className="btn-primary"
        >
          {showInvestmentForm ? 'Cancel' : '+ Add Investment'}
        </button>
        <button
          onClick={() => setShowTransactionForm(!showTransactionForm)}
          className="btn-secondary"
        >
          {showTransactionForm ? 'Cancel' : '+ Add Transaction'}
        </button>
        <button
          onClick={async () => {
            try {
              await axios.post(`${API_URL}/api/investments/refresh-prices`)
              fetchData()
              alert('Prices refreshed successfully!')
            } catch (error) {
              console.error('Failed to refresh prices:', error)
              alert('Failed to refresh prices')
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🔄 Refresh Prices
        </button>
      </div>

      {/* Investment Form */}
      {showInvestmentForm && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Investment</h2>
          <form onSubmit={handleInvestmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                <select
                  value={investmentForm.asset_type}
                  onChange={(e) =>
                    setInvestmentForm({ ...investmentForm, asset_type: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="stock">Stock</option>
                  <option value="etf">ETF</option>
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="bond">Bond</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Symbol</label>
                <input
                  type="text"
                  value={investmentForm.symbol}
                  onChange={(e) =>
                    setInvestmentForm({ ...investmentForm, symbol: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Units</label>
                <input
                  type="number"
                  step="0.000001"
                  value={investmentForm.units}
                  onChange={(e) =>
                    setInvestmentForm({ ...investmentForm, units: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Avg Buy Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={investmentForm.avg_buy_price}
                  onChange={(e) =>
                    setInvestmentForm({ ...investmentForm, avg_buy_price: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Basis</label>
                <input
                  type="number"
                  step="0.01"
                  value={investmentForm.cost_basis}
                  onChange={(e) =>
                    setInvestmentForm({ ...investmentForm, cost_basis: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Investment
            </button>
          </form>
        </div>
      )}

      {/* Transaction Form */}
      {showTransactionForm && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Transaction</h2>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Symbol</label>
                <input
                  type="text"
                  value={transactionForm.symbol}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, symbol: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, type: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                  <option value="dividend">Dividend</option>
                  <option value="contribution">Contribution</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  step="0.000001"
                  value={transactionForm.quantity}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, quantity: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.price}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, price: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fees</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.fees}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, fees: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Transaction
            </button>
          </form>
        </div>
      )}

      {/* Investments Table */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Investments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost Basis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inv.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inv.asset_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(inv.units).toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${parseFloat(inv.cost_basis).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(parseFloat(inv.current_value) || parseFloat(inv.cost_basis)).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.executed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(tx.quantity).toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${parseFloat(tx.price).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(parseFloat(tx.quantity) * parseFloat(tx.price) + parseFloat(tx.fees || 0)).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Portfolio

