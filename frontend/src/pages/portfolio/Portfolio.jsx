import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as portfolioApi from '../../api/portfolioApi'; 
import Loader from '../../components/common/Loader'; 
import Card from '../../components/common/Card'; 

const Portfolio = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({ total_invested: 0, current_value: 0, total_gain: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Fetch Data
  const fetchPortfolio = async () => {
    try {
      const response = await portfolioApi.getPortfolioSummary();
      const data = response.data;

      // Handle different backend response structures safely
      let invList = [];
      if (Array.isArray(data)) invList = data;
      else if (data.investments) invList = data.investments;
      else if (data.data) invList = data.data;

      setInvestments(invList);

      setSummary({
        total_invested: data.total_invested || 0,
        current_value: data.current_value || 0,
        total_gain: data.total_gain || 0
      });
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Sync Live Prices
  const handleSync = async () => {
    setSyncing(true);
    try {
      await portfolioApi.syncPrices();
      alert("Market prices updated successfully!");
      await fetchPortfolio(); 
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync prices. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await portfolioApi.deleteInvestment(id);
        fetchPortfolio();
      } catch (error) {
        alert("Failed to delete asset.");
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

  if (loading) return <div className="flex justify-center p-10"><Loader /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Portfolio</h1>
          <p className="text-slate-500 mt-1">Manage your assets and track performance.</p>
        </div>
        
        <div className="flex gap-3">
          {/* Sync Button */}
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-all ${syncing ? 'opacity-70 cursor-wait' : ''}`}
          >
            {syncing ? (
              <>⏳ Syncing...</>
            ) : (
              <>🔄 Sync Prices</>
            )}
          </button>

          {/* Add Asset Button */}
          <button 
            onClick={() => navigate('/portfolio/add')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
          >
            + Add Asset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Total Invested</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(summary.total_invested)}</p>
        </Card>
        
        <Card className="p-6 border-l-4 border-emerald-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Current Value</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatMoney(summary.current_value)}</p>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Total Gain</p>
          <p className={`text-2xl font-bold mt-1 ${summary.total_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.total_gain >= 0 ? '+' : ''}{formatMoney(summary.total_gain)}
          </p>
        </Card>
      </div>

      {/* Table */}
      {investments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-slate-700">No Investments Yet</h3>
          <p className="text-slate-500 mt-2 mb-4">Add assets to see them listed here.</p>
          <button onClick={() => navigate('/portfolio/add')} className="text-blue-600 font-bold hover:underline">
            Add your first asset &rarr;
          </button>
        </Card>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  <th className="p-4">Asset Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Units</th>
                  <th className="p-4 text-right">Invested</th>
                  <th className="p-4 text-right">Current Value</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {investments.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{asset.asset_name}</td>
                    
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 uppercase font-bold">
                        {asset.category}
                      </span>
                    </td>
                    
                    <td className="p-4 text-right text-slate-600">{asset.units}</td>
                    
                    <td className="p-4 text-right font-medium text-slate-600">
                      {formatMoney(asset.amount_invested)}
                    </td>

                    <td className="p-4 text-right font-bold text-emerald-700">
                      {formatMoney(asset.current_value)}
                    </td>

                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Asset"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;