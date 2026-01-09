import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as goalsApi from '../../api/goalsApi'; 
import Input from '../../components/common/Input'; 
import Card from '../../components/common/Card';

const GoalCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // We removed 'monthly_contribution' from state because we calculate it
  const [formData, setFormData] = useState({
    goal_type: 'retirement',
    target_amount: '',
    target_date: '',
  });

  const [calculatedMonthly, setCalculatedMonthly] = useState(0);
  const [monthsRemaining, setMonthsRemaining] = useState(0);

  const goalOptions = [
    { label: "Retirement", value: "retirement" },
    { label: "Home Purchase", value: "home" },
    { label: "Education", value: "education" },
    { label: "Other / Custom", value: "custom" } 
  ];

  // --- 🧮 THE CALCULATOR LOGIC ---
  useEffect(() => {
    if (formData.target_amount && formData.target_date) {
      const targetDate = new Date(formData.target_date);
      const today = new Date();

      // Calculate months difference
      let months = (targetDate.getFullYear() - today.getFullYear()) * 12;
      months -= today.getMonth();
      months += targetDate.getMonth();

      // Ensure at least 1 month to avoid division by zero
      const validMonths = months <= 0 ? 1 : months;
      
      const amount = parseFloat(formData.target_amount) || 0;
      const monthlyNeed = amount / validMonths;

      setMonthsRemaining(validMonths);
      setCalculatedMonthly(monthlyNeed);
    } else {
      setCalculatedMonthly(0);
      setMonthsRemaining(0);
    }
  }, [formData.target_amount, formData.target_date]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        goal_type: formData.goal_type,
        target_amount: parseFloat(formData.target_amount),
        
        // 🚀 WE SEND THE CALCULATED VALUE AUTOMATICALLY
        monthly_contribution: parseFloat(calculatedMonthly.toFixed(2)),
        
        target_date: new Date(formData.target_date).toISOString(),
        status: "active"
      };

      await goalsApi.createGoal(payload);
      navigate('/goals'); 
    } catch (err) {
      console.error("Error:", err);
      const responseData = err.response?.data;
      let safeErrorMessage = "Failed to create goal.";
      
      if (responseData?.detail) {
        if (Array.isArray(responseData.detail)) {
          safeErrorMessage = responseData.detail.map(e => `${e.loc[1]}: ${e.msg}`).join(" | ");
        } else {
          safeErrorMessage = responseData.detail;
        }
      }
      setError(safeErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate('/goals')} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2">
        &larr; Back to Goals
      </button>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Plan a New Goal</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            🚨 <b>Error:</b> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goal Type</label>
            <select
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Target Amount */}
          <Input 
            label="I want to save (₹)"
            name="target_amount" 
            type="number" 
            step="1000"
            placeholder="e.g. 500000"
            value={formData.target_amount}
            onChange={handleChange}
            required
          />

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">By Date</label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* 💡 THE SMART INFO CARD */}
          {calculatedMonthly > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm text-blue-800 font-medium">Suggestion:</p>
                <p className="text-blue-900 text-sm mt-1">
                  To reach this goal in <b>{monthsRemaining} months</b>, you need to save approximately:
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {formatMoney(calculatedMonthly)} / month
                </p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || calculatedMonthly <= 0}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all disabled:opacity-70 mt-4"
          >
            {loading ? 'Calculating...' : 'Create Plan'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default GoalCreate;