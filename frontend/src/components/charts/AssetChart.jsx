import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const AssetChart = ({ assets }) => {
  // 1. COLORS for different categories
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  // 2. DATA PROCESSING: Group assets by Category and Sum their values
  // Input: [{category: 'Gold', value: 5000}, {category: 'Gold', value: 1000}, {category: 'Equity', value: 2000}]
  // Output: [{name: 'Gold', value: 6000}, {name: 'Equity', value: 2000}]
  const data = assets.reduce((acc, asset) => {
    const category = asset.category || 'Other';
    const existing = acc.find(item => item.name === category);
    
    if (existing) {
      existing.value += asset.current_value || asset.amount_invested;
    } else {
      acc.push({ name: category, value: asset.current_value || asset.amount_invested });
    }
    return acc;
  }, []);

  // Format currency for tooltip
  const formatMoney = (value) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  // Custom Tooltip Design
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800">{payload[0].name}</p>
          <p className="text-blue-600 font-medium">{formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  return (
    <Card className="p-6 h-full flex flex-col justify-center items-center">
      <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-left">Asset Allocation</h3>
      
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Makes it a Doughnut Chart (looks modern)
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AssetChart;