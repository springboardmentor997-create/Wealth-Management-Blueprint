import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  Save,
  Trash2
} from 'lucide-react';
import AnimatedLineChart from '../components/charts/AnimatedLineChart';

/**
 * Simulations Page
 * Aligned with WealthManagementProject reference design.
 * Features:
 * - Interactive Sliders for inputs
 * - Real-time chart visualization (on Run)
 * - Glassmorphism UI
 * - Backend Integration (Save/Load)
 */

export default function Simulations() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [goals, setGoals] = useState([]);
  const [savedSimulations, setSavedSimulations] = useState([]);

  // Form State
  const [scenarionName, setScenarioName] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [error, setError] = useState(null);

  const [params, setParams] = useState({
    initialInvestment: 100000,
    monthlyContribution: 2000,
    annualReturn: 8,
    inflationRate: 3,
    years: 20,
  });

  // Load initial data (Goals & Saved Simulations)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, simsRes] = await Promise.all([
        axios.get('http://localhost:8000/goals/'),
        axios.get('http://localhost:8000/simulations/')
      ]);
      setGoals(goalsRes.data);
      setSavedSimulations(simsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const handleGoalSelect = (e) => {
    const gId = e.target.value;
    setSelectedGoalId(gId);

    if (gId) {
      const goal = goals.find(g => g.id.toString() === gId);
      if (goal) {
        const yearsLeft = Math.max(1, new Date(goal.target_date).getFullYear() - new Date().getFullYear());
        setParams(prev => ({
          ...prev,
          monthlyContribution: goal.monthly_contribution,
          years: yearsLeft
        }));
        setScenarioName(`Plan for ${goal.goal_type}`);
      }
    } else {
      setScenarioName("");
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);

    // Construct payload for backend
    const payload = {
      scenario_name: scenarionName || `Simulation ${new Date().toLocaleTimeString()}`,
      goal_id: selectedGoalId ? parseInt(selectedGoalId) : null,
      assumptions: {
        initial_amount: params.initialInvestment,
        monthly_contribution: params.monthlyContribution,
        rate: params.annualReturn,
        years: params.years,
        inflation_rate: params.inflationRate
      }
    };

    try {
      const res = await axios.post('http://localhost:8000/simulations/', payload);
      if (res.data && res.data.results) {
        setResults(res.data.results);
        setSavedSimulations(prev => [res.data, ...prev]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Simulation failed", err);
      setError("Failed to run simulation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({
      initialInvestment: 100000,
      monthlyContribution: 2000,
      annualReturn: 8,
      inflationRate: 3,
      years: 20,
    });
    setResults(null);
    setScenarioName("");
    setSelectedGoalId("");
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this simulation?")) return;
    try {
      await axios.delete(`http://localhost:8000/simulations/${id}`);
      setSavedSimulations(prev => prev.filter(s => s.id !== id));
      if (results && savedSimulations.find(s => s.id === id)?.id === (results.id || 0)) { // rough check
        setResults(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Derived Metrics (Robust Fallback)
  const projectedValue = results?.projectedValue ?? results?.summary?.final_balance ?? 0;
  const totalInvested = results?.contributed ?? results?.summary?.total_contributions ?? 0;
  const totalGrowthPercent = totalInvested > 0 ? ((projectedValue - totalInvested) / totalInvested) * 100 : 0;
  const confidence = results?.confidence ?? 85; // Default confidence

  // Data Mapping for Chart (Robust Fallback for both old/new backend)
  const rawTimeline = results?.timeline || results?.yearly_breakdown || [];

  const chartData = rawTimeline.map(p => ({
    date: `Year ${p.year}`,
    // Support both 'value' (New) and 'balance' (Old)
    value: p.value ?? p.balance ?? 0,
    // Support both 'contributed' (New) and 'contributions' (Old)
    benchmark: p.contributed ?? p.contributions ?? 0
  }));

  // Chart Formatting Helpers
  const formatValue = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 rounded-xl border border-white/10 bg-slate-900/90">
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="font-semibold text-amber-400">
              Portfolio: {formatValue(payload[0].value)}
            </p>
            {payload[1] && (
              <p className="text-sm text-teal-400">
                Invested: {formatValue(payload[1].value)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Investment Simulations
          </h1>
          <p className="text-muted-foreground mt-2">
            Project your wealth growth over time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Parameters
              </h2>
            </div>

            {/* Scenario Name & Goal Link */}
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-white/5 mb-6">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Scenario Name</label>
                <input
                  type="text"
                  value={scenarionName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g. Retirement Plan A"
                  className="w-full bg-secondary border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Link to Goal</label>
                <select
                  value={selectedGoalId}
                  onChange={handleGoalSelect}
                  className="w-full bg-secondary border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Custom Simulation --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.goal_type} (₹{g.target_amount.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>

            <SliderBlock
              label="Initial Investment"
              value={params.initialInvestment}
              min={1000}
              max={1000000}
              step={1000}
              prefix="₹"
              onChange={(v) => setParams(p => ({ ...p, initialInvestment: v }))}
            />

            <SliderBlock
              label="Monthly Contribution"
              value={params.monthlyContribution}
              min={0}
              max={100000}
              step={500}
              prefix="₹"
              onChange={(v) => setParams(p => ({ ...p, monthlyContribution: v }))}
            />

            <SliderBlock
              label="Annual Return"
              value={params.annualReturn}
              min={1}
              max={25}
              step={0.5}
              suffix="%"
              color="indigo"
              onChange={(v) => setParams(p => ({ ...p, annualReturn: v }))}
            />

            <SliderBlock
              label="Inflation Rate"
              value={params.inflationRate}
              min={0}
              max={15}
              step={0.5}
              suffix="%"
              color="rose"
              onChange={(v) => setParams(p => ({ ...p, inflationRate: v }))}
            />

            <SliderBlock
              label="Time Horizon"
              value={params.years}
              min={1}
              max={50}
              step={1}
              suffix=" Years"
              color="emerald"
              onChange={(v) => setParams(p => ({ ...p, years: v }))}
            />

            <div className="flex gap-3 pt-4">
              <GlassButton
                className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
                onClick={handleRun}
                loading={loading}
                icon={<Play className="w-4 h-4" />}
              >
                Run
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={handleReset}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </GlassButton>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm rounded mt-4">
                {error}
              </div>
            )}
          </motion.div>

          {/* Results Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {results ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={DollarSign}
                    label="Projected Value"
                    value={`₹${projectedValue.toLocaleString()}`}
                    color="text-emerald-400"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Total Growth"
                    value={`${totalGrowthPercent.toFixed(1)}%`}
                    color="text-indigo-400"
                  />
                  <StatCard
                    icon={Calendar}
                    label="Time Period"
                    value={`${params.years} Years`}
                    color="text-slate-200"
                  />
                  <StatCard
                    icon={Percent}
                    label="Confidence"
                    value={`${results.confidence || 85}%`}
                    color="text-amber-400"
                  />
                </div>

                {/* Main Chart */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
                    <span>📈</span> Wealth Growth Projection
                  </h3>

                  <AnimatedLineChart
                    data={chartData}
                    showBenchmark
                    showArea
                    height={350}
                  />
                </div>
              </>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <TrendingUp className="w-16 h-16 text-slate-700 mb-6" />
                <h3 className="text-xl font-bold text-slate-300">Ready to Simulate</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Adjust the parameters on the left and click "Run" to see how your wealth can grow over time.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Saved Simulations List */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-400" /> Saved Scenarios
          </h2>

          {savedSimulations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No saved scenarios yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSimulations.map(sim => (
                <div key={sim.id} className="glass-card p-5 group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{sim.scenario_name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(sim.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(sim.id)}
                      className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 p-1.5 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Final Balance</span>
                      <span className="text-emerald-400 font-bold">₹{Math.round(sim.results?.projectedValue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Years</span>
                      <span className="text-white">{sim.assumptions.years}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}

/* ===============================
   HELPER COMPONENTS
   =============================== */

const SliderBlock = ({ label, value, min, max, step, onChange, prefix = "", suffix = "", color = "indigo" }) => {
  // Tailwind color classes for accent
  const accentColor = {
    indigo: "accent-indigo-500",
    rose: "accent-rose-500",
    emerald: "accent-emerald-500",
    amber: "accent-amber-500"
  }[color] || "accent-white";

  const textColor = {
    indigo: "text-indigo-400",
    rose: "text-rose-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400"
  }[color] || "text-white";

  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-slate-400 font-medium">{label}</label>
        <span className={`text-sm font-bold font-mono ${textColor}`}>
          {prefix}{value.toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${accentColor} hover:opacity-100 transition-opacity`}
      />
    </div>
  );
};


const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-4 flex flex-col justify-between h-24">
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <Icon className={`w-5 h-5 opacity-80 ${color}`} />
    </div>
    <p className={`text-xl font-bold ${color || 'text-foreground'}`}>{value}</p>
  </div>
);

const GlassButton = ({ children, onClick, variant = 'primary', icon, loading, className = "" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`
      flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
      ${variant === 'primary'
        ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 hover:border-primary/50'
        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/20'}
      ${loading ? 'opacity-70 cursor-wait' : ''}
      ${className}
    `}
  >
    {loading && <span className="animate-spin text-lg">♻️</span>}
    {!loading && icon}
    {children}
  </button>
);
