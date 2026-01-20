import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';

const PersonalizedSuggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [rebalancing, setRebalancing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [suggestionsRes, rebalancingRes] = await Promise.all([
        apiClient.get('/recommendations/personalized/suggestions'),
        apiClient.get('/recommendations/personalized/rebalancing'),
      ]);

      setSuggestions(suggestionsRes.data);
      setRebalancing(rebalancingRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch suggestions');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareAllocationChartData = (recommended, current) => {
    return [
      { name: 'Stocks', recommended: (recommended.stocks * 100), current: (current.stocks * 100) },
      { name: 'Bonds', recommended: (recommended.bonds * 100), current: (current.bonds * 100) },
      { name: 'Crypto', recommended: (recommended.crypto * 100), current: (current.crypto * 100) },
      { name: 'ETF', recommended: (recommended.etf * 100), current: (current.etf * 100) },
      { name: 'Cash', recommended: (recommended.cash * 100), current: (current.cash * 100) },
    ];
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 animate-pulse">Loading engine...</div>;
  }

  const allocationData = suggestions ? prepareAllocationChartData(
    suggestions.recommended_allocation,
    suggestions.current_allocation
  ) : [];

  const riskProfileColors = {
    aggressive: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    moderate: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    conservative: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  };

  const alignmentColor = suggestions?.alignment_score >= 80 ? 'text-emerald-400' : suggestions?.alignment_score >= 60 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
            🤖 AI Wealth Engine
          </h1>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded">
              {error}
              <button onClick={fetchSuggestions} className="ml-4 underline hover:text-red-300">Retry</button>
            </div>
          )}

          {/* Summary Cards */}
          {suggestions && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
              {/* Risk Profile Card */}
              <div className={`glass-card p-4 border ${riskProfileColors[suggestions.risk_profile]} border-l-4`}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Risk Profile</p>
                <p className="text-2xl font-bold capitalize">{suggestions.risk_profile}</p>
              </div>

              {/* Alignment Score Card */}
              <div className="glass-card p-4 border border-slate-700/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Alignment Score</p>
                <p className={`text-2xl font-bold ${alignmentColor}`}>
                  {suggestions.alignment_score}%
                </p>
              </div>

              {/* Watchlist Items Card */}
              <div className="glass-card p-4 border border-slate-700/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Watchlist Ops</p>
                <p className="text-2xl font-bold text-blue-400">
                  {suggestions.watchlist_items_count}
                </p>
              </div>

              {/* Active Goals Card */}
              <div className="glass-card p-4 border border-slate-700/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Goals</p>
                <p className="text-2xl font-bold text-purple-400">
                  {suggestions.active_goals_count}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['suggestions', 'rebalancing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition capitalize ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'glass-card text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
            >
              {tab === 'suggestions' ? 'Allocation & Insights' : 'Rebalancing Strategy'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'suggestions' && suggestions && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Insights */}
              <div className="glass-card p-6 lg:col-span-1">
                <h2 className="text-xl font-bold text-slate-200 mb-4">💡 AI Insights</h2>
                <div className="space-y-3">
                  {suggestions.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-indigo-500/10 rounded border border-indigo-500/20">
                      <span className="text-indigo-400">✨</span>
                      <p className="text-slate-300 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Comparison Chart */}
              <div className="glass-card p-6 lg:col-span-2">
                <h2 className="text-xl font-bold text-slate-200 mb-4">Allocation vs Target</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={allocationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="current" fill="#10b981" name="Current %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recommended" fill="#3b82f6" name="Target %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Watchlist Stocks */}
            {suggestions.top_watchlist_stocks.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-200 mb-4">🚀 Top Watchlist Movers</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-slate-300">
                    <thead className="text-slate-400 bg-slate-800/50 uppercase text-xs">
                      <tr>
                        <th className="text-left py-3 px-4">Symbol</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-right py-3 px-4">Price</th>
                        <th className="text-right py-3 px-4">Gain</th>
                        <th className="text-left py-3 px-4">Sector</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {suggestions.top_watchlist_stocks.map((stock, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition">
                          <td className="py-3 px-4 font-bold text-white">{stock.symbol}</td>
                          <td className="py-3 px-4 text-slate-400">{stock.name}</td>
                          <td className="py-3 px-4 text-right">${stock.current_price.toFixed(2)}</td>
                          <td className={`py-3 px-4 text-right font-bold ${stock.gain_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stock.gain_percent >= 0 ? '+' : ''}{stock.gain_percent.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4">{stock.sector || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rebalancing Tab */}
        {activeTab === 'rebalancing' && rebalancing && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Rebalancing Summary */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-4">Strategy Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${rebalancing.portfolio_total_value?.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase mb-1">Risk Mode</p>
                  <p className="text-2xl font-bold text-purple-400 capitalize">
                    {rebalancing.risk_profile}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase mb-1">Suggest Freq.</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {rebalancing.suggested_frequency}
                  </p>
                </div>
              </div>
            </div>

            {/* Rebalancing Actions */}
            {rebalancing.rebalancing_actions.length > 0 ? (
              <div className="glass-card p-6 border-l-4 border-amber-500">
                <h2 className="text-xl font-bold text-slate-200 mb-4">⚠️ Recommended Actions</h2>
                <div className="space-y-3">
                  {rebalancing.rebalancing_actions.map((action, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded border flex justify-between items-center ${action.action === 'BUY'
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-rose-500/10 border-rose-500/30'
                        }`}
                    >
                      <div>
                        <p className="font-bold text-slate-200 text-lg">{action.asset_class}</p>
                        <p className="text-sm text-slate-400">{action.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold px-2 py-1 rounded ${action.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                          {action.action}
                        </span>
                        <p className="text-xl font-mono text-slate-200 mt-1">${action.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-slate-500">
                <p className="text-lg">✅ Your portfolio is perfectly balanced!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedSuggestions;
