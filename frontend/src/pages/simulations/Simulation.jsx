import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Simulations = () => {
  // 1. STATE FOR INPUTS
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [rate, setRate] = useState(12); // 12% is standard for Equity
  const [years, setYears] = useState(10);
  
  const [result, setResult] = useState({ invested: 0, returns: 0, total: 0 });
  const [chartData, setChartData] = useState([]);

  // 2. CALCULATION LOGIC (The "Magic" Math)
  useEffect(() => {
    const calculateWealth = () => {
      const monthlyRate = rate / 12 / 100;
      const months = years * 12;
      
      // Future Value Formula for SIP
      // FV = P * [ (1+i)^n - 1 ] * (1+i) / i
      const totalValue = (monthlyInvestment * (Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) / monthlyRate;
      const totalInvested = monthlyInvestment * months;
      const totalReturns = totalValue - totalInvested;

      setResult({
        invested: Math.round(totalInvested),
        returns: Math.round(totalReturns),
        total: Math.round(totalValue)
      });

      // Generate Data Points for the Chart (Year by Year)
      const data = [];
      let currentVal = 0;
      let investedVal = 0;
      
      for (let i = 0; i <= years; i++) {
        // Simple approximation for chart points
        if (i === 0) {
            data.push({ year: `Year 0`, invested: 0, value: 0 });
        } else {
            const m = i * 12;
            const val = (monthlyInvestment * (Math.pow(1 + monthlyRate, m) - 1) * (1 + monthlyRate)) / monthlyRate;
            data.push({
                year: `Year ${i}`,
                invested: monthlyInvestment * m,
                value: Math.round(val)
            });
        }
      }
      setChartData(data);
    };

    calculateWealth();
  }, [monthlyInvestment, rate, years]);

  const formatMoney = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Wealth Simulator</h1>
        <p className="text-slate-500 mt-1">Project your future wealth with the power of compounding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-6">Input Configuration</h3>
            
            {/* Monthly Investment Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Investment (SIP)</label>
              <div className="text-2xl font-bold text-blue-600 mb-2">{formatMoney(monthlyInvestment)}</div>
              <input 
                type="range" min="500" max="100000" step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹500</span>
                <span>₹1L</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Expected Return Rate (p.a)</label>
              <div className="text-2xl font-bold text-emerald-600 mb-2">{rate}%</div>
              <input 
                type="range" min="1" max="30" step="0.5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>FD (6%)</span>
                <span>Equity (12%)</span>
                <span>Crypto (20%+)</span>
              </div>
            </div>

            {/* Time Period Slider */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
              <div className="text-2xl font-bold text-purple-600 mb-2">{years} Years</div>
              <input 
                type="range" min="1" max="50" step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </Card>

          {/* Result Summary Card */}
          <Card className="p-6 bg-slate-900 text-white text-center">
            <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Projected Value</p>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {formatMoney(result.total)}
            </h2>
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
              <div className="text-left">
                <p className="text-slate-400">Invested</p>
                <p className="font-bold">{formatMoney(result.invested)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Est. Returns</p>
                <p className="font-bold text-emerald-400">+{formatMoney(result.returns)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: CHART */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6">Wealth Growth Projection</h3>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748B'}} 
                    tickFormatter={(val) => `₹${val/100000}L`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatMoney(value), "Value"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    stroke="#CBD5E1" 
                    strokeDasharray="5 5"
                    fill="transparent" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Simulations;