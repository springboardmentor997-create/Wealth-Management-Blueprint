import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as portfolioApi from '../../api/portfolioApi'; 
import Input from '../../components/common/Input'; 
import Card from '../../components/common/Card';

const AddInvestment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    asset_name: '',
    category: 'Equity', 
    amount_invested: '',
    current_value: '', 
    units: '',
  });

  const categories = ["Equity", "Mutual Fund", "Gold", "Real Estate", "Crypto", "Fixed Deposit", "Other"];

  // --- 🔍 SEARCH LOGIC ---
  const handleSearch = async (e) => {
    e.preventDefault(); 
    if (!searchQuery) return;
    
    setIsSearching(true);
    setSearchResults([]); // Clear previous results
    
    try {
      const res = await portfolioApi.searchAssets(searchQuery);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAsset = (asset) => {
    setFormData({
      ...formData,
      asset_name: asset.symbol, // Use the Ticker Symbol (e.g. RELIANCE.NS)
      category: asset.type === 'ETF' ? 'Gold' : 'Equity' 
    });
    setSearchResults([]); // Hide dropdown
    setSearchQuery(''); // Clear search bar
  };
  // -----------------------

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Force convert everything to Numbers
    const amount = parseFloat(formData.amount_invested);
    const units = formData.units ? parseFloat(formData.units) : 0;
    const currentVal = formData.current_value ? parseFloat(formData.current_value) : amount;

    // 2. Log what we are sending (Check your browser console!)
    const payload = {
      asset_name: formData.asset_name,
      category: formData.category,
      amount_invested: amount,
      current_value: currentVal,
      units: units
    };
    
    console.log("🚀 SENDING PAYLOAD:", payload);

    try {
      await portfolioApi.addInvestment(payload);
      navigate('/portfolio'); 
    } catch (err) {
      console.error("❌ BACKEND ERROR:", err);
      
      // --- DEBUG CODE: SHOW RAW ERROR ON SCREEN ---
      const res = err.response;
      let msg = "Failed to add investment.";

      if (res?.data) {
        if (res.data.detail) {
          // If detail is an array (FastAPI validation error)
          if (Array.isArray(res.data.detail)) {
            msg = res.data.detail.map(e => `${e.loc[1]}: ${e.msg}`).join(" | ");
          } else {
            msg = res.data.detail;
          }
        } else {
           // Show raw JSON if structure is unknown
           msg = JSON.stringify(res.data);
        }
      } else {
        msg = err.message;
      }
      
      setError(msg); // <--- This will put the REAL error in the red box
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate('/portfolio')} className="text-slate-500 mb-6 flex items-center gap-2">
        &larr; Back to Portfolio
      </button>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Asset</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            🚨 {error}
          </div>
        )}

        {/* --- 🔍 SMART SEARCH SECTION --- */}
        <div className="mb-6 relative">
           <label className="block text-sm font-medium text-slate-700 mb-1">Search Market Asset</label>
           <div className="flex gap-2">
             <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="e.g. Tata, Reliance, Gold"
               className="flex-1 px-4 py-3 rounded-lg border border-slate-300 outline-none focus:border-blue-500 transition-colors"
             />
             <button 
               onClick={handleSearch}
               disabled={isSearching}
               className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-70"
             >
               {isSearching ? '...' : '🔍'}
             </button>
           </div>

           {/* Dropdown Results */}
           {searchResults.length > 0 && (
             <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
               {searchResults.map((item, idx) => (
                 <div 
                   key={idx}
                   onClick={() => selectAsset(item)}
                   className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                 >
                   <div className="font-bold text-slate-800">{item.symbol}</div>
                   <div className="text-xs text-slate-500">{item.name} ({item.exchange})</div>
                 </div>
               ))}
             </div>
           )}
        </div>
        {/* ------------------------------- */}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Asset Name */}
          <Input 
            label="Asset Symbol / Name"
            name="asset_name" 
            value={formData.asset_name}
            onChange={handleChange}
            required
            placeholder="Selected Symbol appears here..."
          />

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Quantity (Units)"
              name="units" 
              type="number" 
              step="any"
              placeholder="e.g. 10"
              value={formData.units}
              onChange={handleChange}
            />
            <Input 
              label="Total Invested (₹)"
              name="amount_invested" 
              type="number" 
              step="100"
              placeholder="e.g. 5000"
              value={formData.amount_invested}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all disabled:opacity-70 mt-4"
          >
            {loading ? 'Adding Investment...' : 'Add Investment'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AddInvestment;