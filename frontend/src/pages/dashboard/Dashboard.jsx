import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client'; // Using your base client for direct calls
import * as portfolioApi from '../../api/portfolioApi'; 
import * as goalsApi from '../../api/goalsApi';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import AssetChart from '../../components/charts/AssetChart'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    netWorth: 0,
    totalGain: 0,
    activeGoals: 0,
    monthlyCommitment: 0,
    unallocated: 0,
    topAssets: [],
    allAssets: [],
    nextGoal: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [portfolioRes, goalsRes] = await Promise.all([
        portfolioApi.getPortfolioSummary(),
        goalsApi.getGoals()
      ]);

      const pData = portfolioRes.data;
      const investments = Array.isArray(pData.investments) ? pData.investments : [];
      
      let goalsList = [];
      const gData = goalsRes.data;
      if (Array.isArray(gData)) goalsList = gData;
      else if (gData?.goals) goalsList = gData.goals;

      // Calculate logic for Allocation
      const totalPortfolioValue = pData.current_value || 0;
      const totalGoalFunding = goalsList.reduce((sum, g) => sum + (g.current_amount || 0), 0);
      const monthlySum = goalsList.reduce((sum, goal) => sum + (goal.monthly_contribution || 0), 0);
      
      const sortedGoals = [...goalsList].sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
      const upcoming = sortedGoals.length > 0 ? sortedGoals[0] : null;

      setStats({
        netWorth: totalPortfolioValue,
        totalGain: pData.total_gain || 0,
        activeGoals: goalsList.length,
        monthlyCommitment: monthlySum,
        unallocated: totalPortfolioValue - totalGoalFunding,
        topAssets: [...investments].sort((a, b) => b.current_value - a.current_value).slice(0, 4),
        allAssets: investments,
        nextGoal: upcoming
      });

    } catch (error) {
      console.error("Dashboard Load Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoneyToGoal = async (goalId) => {
  const amount = prompt("Enter amount to allocate to this goal from your portfolio:");
  
  // Validation: Ensure it's a positive number
  if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
    try {
      setLoading(true); // 👈 Add this to show the loader while updating
      
      const response = await client.post(`/goals/${goalId}/contribute`, { 
        amount: parseFloat(amount) 
      });
      
      console.log("Allocation Success:", response.data);
      
      // 🔄 CRITICAL: Re-fetch all data to recalculate Net Worth and Goal Progress
      await loadDashboardData(); 
      
      alert(`₹${amount} successfully allocated!`);
    } catch (err) {
      console.error("Allocation Error:", err);
      alert("Failed to update goal funding. Check console for details.");
    } finally {
      setLoading(false);
    }
  } else if (amount) {
    alert("Please enter a valid positive number.");
  }
};

  const formatMoney = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  const calculatePercent = (cur, tar) => {
  const current = parseFloat(cur) || 0;
  const target = parseFloat(tar) || 0;
  if (target <= 0) return 0;
  
  const rawPercent = (current / target) * 100;

  // If there is progress, but it's very small, show 1 decimal (e.g., 0.4%)
  if (rawPercent > 0 && rawPercent < 1) {
    return rawPercent.toFixed(1); 
  }
  
  // Otherwise, round to the nearest whole number
  return Math.min(Math.round(rawPercent), 100);
};

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Portfolio Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back. Here is your financial standing today.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => navigate('/portfolio/add')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:shadow-sm">Add Asset</button>
            <button onClick={() => navigate('/goals/create')} className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md">Create Goal</button>
        </div>
      </div>

      {/* 2. TOP METRICS - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm bg-white">
          <p className="text-gray-500 text-[11px] font-bold uppercase">Total Net Worth</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">{formatMoney(stats.netWorth)}</h2>
        </Card>
        
        <Card className="p-5 border-none shadow-sm bg-white">
          <p className="text-gray-500 text-[11px] font-bold uppercase">Total Unrealized P&L</p>
          <h2 className={`text-2xl font-semibold mt-1 ${stats.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.totalGain >= 0 ? '+' : ''}{formatMoney(stats.totalGain)}
          </h2>
        </Card>

        <Card className="p-5 border-none shadow-sm bg-white">
          <p className="text-gray-500 text-[11px] font-bold uppercase">Unallocated Cash</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">{formatMoney(stats.unallocated)}</h2>
          <p className="text-[10px] text-blue-600 font-bold mt-1">Available to assign to goals</p>
        </Card>

        <Card className="p-5 border-none shadow-sm bg-white">
          <p className="text-gray-500 text-[11px] font-bold uppercase">Monthly SIP Need</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">{formatMoney(stats.monthlyCommitment)}</h2>
        </Card>
      </div>

      {/* 3. GOAL TRACKER - Row 2 (Strategic Placement) */}
      {stats.nextGoal && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#1A73E8]"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600 font-bold">🎯</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">PRIORITY GOAL: {stats.nextGoal.title}</h3>
                <p className="text-xs text-gray-400">Targeting {formatMoney(stats.nextGoal.target_amount)} by {new Date(stats.nextGoal.target_date).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})}</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-6">
               <div className="text-right">
                  <span className="text-2xl font-bold text-[#1A73E8]">{calculatePercent(stats.nextGoal.current_amount, stats.nextGoal.target_amount)}%</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funded</p>
               </div>
               <button 
                 onClick={() => handleAddMoneyToGoal(stats.nextGoal.id)}
                 className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200"
               >
                 + DISTRIBUTE FUNDS
               </button>
            </div>
          </div>

          {/* Linear Goal Tracker */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
             <div 
               className="bg-[#1A73E8] h-2.5 rounded-full transition-all duration-700 ease-in-out" 
               style={{ width: `${calculatePercent(stats.nextGoal.current_amount, stats.nextGoal.target_amount)}%` }}
             ></div>
          </div>
          
          <div className="flex justify-between mt-3">
             <span className="text-[10px] font-bold text-gray-400 uppercase">Allocated: {formatMoney(stats.nextGoal.current_amount)}</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase text-right">Remaining: {formatMoney(stats.nextGoal.target_amount - stats.nextGoal.current_amount)}</span>
          </div>
        </div>
      )}

      {/* 4. ASSETS & CHART - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Asset List */}
        <Card className="p-6 bg-white border-none shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Portfolio Breakdown</h3>
            <button onClick={() => navigate('/portfolio')} className="text-blue-600 text-[11px] font-bold uppercase hover:underline">Full View</button>
          </div>
          <div className="space-y-4">
            {stats.topAssets.map((asset, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-[11px] text-gray-500 uppercase">
                    {asset.asset_name.slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 tracking-tight">{asset.asset_name}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{asset.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatMoney(asset.current_value)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Analytics Chart */}
        <div className="h-full min-h-[350px]">
          {stats.allAssets.length > 0 ? (
            <AssetChart assets={stats.allAssets} /> 
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-100 opacity-60">
               <p className="text-gray-400 text-sm italic">Analytics Visualization Pending Data...</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;