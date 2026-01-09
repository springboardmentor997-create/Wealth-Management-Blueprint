import React from 'react';

const GoalCard = ({ goal }) => {
  // 1. Calculate Progress Percentage
  // Ensure we don't divide by zero
  const progress = goal.target_amount > 0 
    ? Math.min((goal.current_savings / goal.target_amount) * 100, 100) 
    : 0;

  // 2. Color Coding based on Goal Type
  const getTypeColor = (type) => {
    switch (type) {
      case 'retirement': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'home': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'education': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 3. Currency Formatter (Indian Rupee)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 4. Date Formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      {/* Header: Type and Status */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getTypeColor(goal.goal_type)}`}>
          {goal.goal_type}
        </span>
        <span className={`text-xs font-medium ${goal.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
          ● {goal.status.toUpperCase()}
        </span>
      </div>

      {/* Main Amounts */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-800">
          {formatCurrency(goal.current_savings || 0)}
        </h3>
        <p className="text-sm text-gray-500">
          of {formatCurrency(goal.target_amount)} goal
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Footer: Stats */}
      <div className="flex justify-between text-xs text-gray-500 border-t pt-4 mt-2">
        <div>
          <p className="mb-1">Target Date</p>
          <p className="font-semibold text-gray-700">{formatDate(goal.target_date)}</p>
        </div>
        <div className="text-right">
          <p className="mb-1">Monthly Sip</p>
          <p className="font-semibold text-gray-700">{formatCurrency(goal.monthly_contribution)}</p>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;