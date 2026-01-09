import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as goalsApi from '../../api/goalsApi'; 
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';

const GoalsList = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchGoals = async () => {
    try {
      const response = await goalsApi.getGoals();
      console.log("Goals Data:", response.data); // Debugging

      // Robust Data Handling (Arrays vs Objects)
      const data = response.data;
      if (Array.isArray(data)) setGoals(data);
      else if (data?.goals) setGoals(data.goals);
      else setGoals([]);

    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await goalsApi.deleteGoal(id);
        fetchGoals(); // Refresh list
      } catch (error) {
        alert("Failed to delete goal.");
      }
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Goals</h1>
          <p className="text-slate-500 mt-1">Track your progress towards your dreams.</p>
        </div>
        <button 
          onClick={() => navigate('/goals/create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-transform hover:scale-105"
        >
          + New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-slate-700">No Goals Yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Set a target for Retirement, Home, or Education.</p>
          <button onClick={() => navigate('/goals/create')} className="text-blue-600 font-bold hover:underline">
            Create your first goal &rarr;
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-6 hover:shadow-md transition-shadow relative group">
              
              {/* Delete Button (Visible on Hover) */}
              <button 
                onClick={() => handleDelete(goal.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Goal"
              >
                🗑️
              </button>

              {/* Goal Icon & Type */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  goal.goal_type === 'retirement' ? 'bg-purple-100 text-purple-600' :
                  goal.goal_type === 'home' ? 'bg-blue-100 text-blue-600' :
                  goal.goal_type === 'education' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {goal.goal_type === 'retirement' ? '👴' : 
                   goal.goal_type === 'home' ? '🏠' : 
                   goal.goal_type === 'education' ? '🎓' : '🎯'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 capitalize">{goal.goal_type}</h3>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                    {goal.status || "Active"}
                  </span>
                </div>
              </div>

              {/* Progress Data */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target</span>
                  <span className="font-bold text-slate-900">{formatMoney(goal.target_amount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly Plan</span>
                  <span className="font-bold text-blue-600">{formatMoney(goal.monthly_contribution)}</span>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Target Date</span>
                  <span className="text-slate-700">{formatDate(goal.target_date)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsList;