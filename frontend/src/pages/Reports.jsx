import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoadingData(true);
      const res = await apiClient.get('/reports/comprehensive/summary');
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to load report data", err);
      // Don't show error immediately, just let the dashboard be empty or show a retry
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = async (reportType, format) => {
    try {
      setExportLoading(true);
      setError(null);
      setSuccessMessage(null);

      let endpoint = '';
      if (reportType === 'comprehensive') {
        endpoint = `/reports/comprehensive/export?format=${format}`;
      } else if (reportType === 'portfolio') {
        endpoint = `/reports/portfolio/export?format=${format}`;
      } else if (reportType === 'goals') {
        endpoint = `/reports/goals/export?format=${format}`;
      }

      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully!`);
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to export ${reportType} report`);
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-8">📄 Reports & Insights</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✅ {successMessage}
          </div>
        )}

        {/* Live Dashboard Section */}
        {loadingData ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">Loading financial insights...</div>
        ) : reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
            {/* Asset Allocation Chart */}
            <div className="glass-card p-6 lg:col-span-1 min-h-[350px] flex flex-col">
              <h2 className="text-xl font-bold text-slate-200 mb-4">📊 Asset Allocation</h2>
              {reportData.asset_allocation && reportData.asset_allocation.length > 0 ? (
                <div className="flex-1 w-full h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.asset_allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData.asset_allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No investment data available
                </div>
              )}
            </div>

            {/* Smart Insights */}
            <div className="glass-card p-6 lg:col-span-2 flex flex-col">
              <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                💡 AI Insights <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">Auto-Generated</span>
              </h2>
              <div className="flex-1 space-y-3">
                {reportData.recommendations && reportData.recommendations.length > 0 ? (
                  reportData.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                      <span className="text-indigo-400 mt-1">✨</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">Add some investments or goals to generate insights.</p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Net Worth</p>
                  <p className="text-3xl font-bold text-slate-100">
                    ${reportData.summary.total_current.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Return</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${reportData.summary.gain_loss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {reportData.summary.gain_loss >= 0 ? '+' : ''}{reportData.summary.gain_loss_percent}%
                    </p>
                    <p className={`text-sm ${reportData.summary.gain_loss >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                      ({reportData.summary.gain_loss >= 0 ? '+' : ''}${Math.abs(reportData.summary.gain_loss).toLocaleString()})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          📂 Export Data <span className="text-sm font-normal text-slate-500">(PDF / CSV)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Comprehensive Report Card */}
          <div className="glass-card p-6 border-l-4 border-indigo-500">
            <h2 className="text-xl font-bold text-slate-200 mb-2">📊 Comprehensive Report</h2>
            <p className="text-slate-400 text-sm mb-4">
              Get a complete overview including portfolio, goals, watchlist, and personalized recommendations.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('comprehensive', 'pdf')}
                disabled={exportLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📥 Download PDF'}
              </button>
              <button
                onClick={() => handleExport('comprehensive', 'csv')}
                disabled={exportLoading}
                className="w-full btn-secondary disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📊 Download CSV'}
              </button>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/10 rounded text-xs text-slate-300 border border-indigo-500/20">
              <p className="font-semibold mb-1 text-indigo-400">Includes:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Portfolio summary & holdings</li>
                <li>Active goals & milestones</li>
                <li>Watchlist performance</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>
          </div>

          {/* Portfolio Report Card */}
          <div className="glass-card p-6 border-l-4 border-emerald-500">
            <h2 className="text-xl font-bold text-slate-200 mb-2">📈 Portfolio Report</h2>
            <p className="text-slate-400 text-sm mb-4">
              Detailed breakdown of your current holdings and investment performance.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('portfolio', 'pdf')}
                disabled={exportLoading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📥 Download PDF'}
              </button>
              <button
                onClick={() => handleExport('portfolio', 'csv')}
                disabled={exportLoading}
                className="w-full bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📊 Download CSV'}
              </button>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded text-xs text-gray-700">
              <p className="font-semibold mb-1">Contains:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Holdings list</li>
                <li>Purchase prices</li>
                <li>Current values</li>
                <li>Asset types</li>
              </ul>
            </div>
          </div>

          {/* Goals Report Card */}
          <div className="glass-card p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-slate-200 mb-2">🎯 Goals Report</h2>
            <p className="text-slate-400 text-sm mb-4">
              Summary of your financial goals and their current progress.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('goals', 'pdf')}
                disabled={exportLoading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📥 Download PDF'}
              </button>
              <button
                onClick={() => handleExport('goals', 'csv')}
                disabled={exportLoading}
                className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded hover:bg-purple-200 transition disabled:opacity-50"
              >
                {exportLoading ? '⏳ Exporting...' : '📊 Download CSV'}
              </button>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded text-xs text-gray-700">
              <p className="font-semibold mb-1">Includes:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Goal types & targets</li>
                <li>Target dates</li>
                <li>Monthly contributions</li>
                <li>Goal status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-400 mb-4">📋 Report Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-300">
            <div>
              <p className="font-semibold mb-2">PDF Reports</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Professional formatting</li>
                <li>Charts and visualizations</li>
                <li>Easy to share & print</li>
                <li>Better for presentations</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">CSV Reports</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Import to Excel/Sheets</li>
                <li>Data manipulation friendly</li>
                <li>Lightweight format</li>
                <li>Custom analysis ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pro Tips Section */}
        <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-amber-300">
            <li>✓ Generate comprehensive reports monthly to track your progress</li>
            <li>✓ Compare reports over time to identify trends and patterns</li>
            <li>✓ Use CSV exports for detailed data analysis and custom calculations</li>
            <li>✓ Share PDF reports with your financial advisor for better guidance</li>
            <li>✓ Update your risk profile in settings for more accurate recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
