import React, { useEffect, useState } from 'react'
import PerformanceChart from '../../components/PerformanceChart'
import ReportsCard from '../../components/ReportsCard'
import Card from '../../components/Card'
import { getSummary, getPerformance } from '../../api/dashboardApi'

const StatItem = ({ title, value, subtext }) => (
  <div className="flex flex-col">
    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
  </div>
)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([getSummary(), getPerformance()])
        setSummary(s)
        setPerformance(p)
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="h-full flex flex-col gap-4 animate-pulse">
      <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
      <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
    </div>
  )

  if (!summary) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Failed to load dashboard data.</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Financial Overview</h2>
          <p className="text-slate-400">Your wealth summary as of today</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-medium flex items-center gap-2">
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Invested", value: `₹${(summary.total_invested || 0).toLocaleString()}`, sub: "+12% from last month", color: "border-indigo-500", delay: "0ms" },
          { title: "Goals Active", value: summary.total_goals || 0, sub: `${summary.completed_goals || 0} completed`, color: "border-emerald-500", delay: "100ms" },
          { title: "Goal Success", value: `${((summary.goal_completion_rate || 0).toFixed(1))}%`, sub: "On track", color: "border-blue-500", delay: "200ms" },
          { title: "Portfolio Value", value: "₹12.4L", sub: "Estimated", color: "border-amber-500", delay: "300ms" }
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-6 border-l-4 ${stat.color} animate-fade-in-up`} style={{ animationDelay: stat.delay }}>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-bold text-slate-200 mb-4">Portfolio Performance</h3>
          <div className="h-80 w-full mt-4">
            <PerformanceChart data={performance} />
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-bold text-slate-200 mb-4">Quick Actions</h3>
          <div className="space-y-4 mt-2">
            <ReportsCard />
            <button className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
              <span>Review Recommendations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
