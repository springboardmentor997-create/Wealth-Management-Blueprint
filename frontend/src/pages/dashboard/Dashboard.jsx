import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-blue-600 font-bold text-lg animate-pulse">Loading Wealth Planner...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            WealthPlan
          </h1>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {/* Active Tab */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50 cursor-pointer transition-transform hover:scale-105">
            <span className="text-lg">📊</span>
            <span className="font-semibold">Dashboard</span>
          </div>

          {/* Inactive Tabs (Placeholders) */}
          {['Goals', 'Portfolio', 'Simulations', 'Reports'].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl cursor-pointer transition-colors">
              <span className="text-lg opacity-50">🔒</span>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/';}}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-900/20 py-3 rounded-lg transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Overview</h2>
            <p className="text-slate-500 mt-1">
              Good afternoon, <span className="text-blue-600 font-bold text-xl capitalize">{user?.name}</span> 👋
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user?.kyc_status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              KYC: <span className="uppercase">{user?.kyc_status || 'Pending'}</span>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CARD 1: Net Worth */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">💰</span>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Worth</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">$0.00</span>
              <span className="text-sm text-slate-400 font-medium">USD</span>
            </div>
            <div className="mt-4 px-3 py-1 bg-slate-50 rounded-lg text-xs text-slate-500 inline-block border border-slate-200">
              No assets connected
            </div>
          </div>

          {/* CARD 2: Goals */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Goals</h3>
              <button className="text-blue-600 text-xs font-bold hover:underline">+ New Goal</button>
            </div>
            
            {/* Empty State */}
            <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">No goals set yet</p>
              <p className="text-slate-400 text-xs mt-1">Start planning your future today.</p>
            </div>
          </div>

          {/* CARD 3: Risk Profile */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Profile</h3>
            <div className="text-2xl font-bold capitalize text-blue-300 mb-4">
              {user?.risk_profile || 'Unassessed'}
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your profile suggests a balanced allocation between equity and bonds.
            </p>
            
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
              Retake Assessment
            </button>
          </div>

          {/* WIDE CARD: Market Data (Placeholder) */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Market Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['S&P 500', 'NASDAQ', 'Gold'].map((market) => (
                <div key={market} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">{market}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono text-slate-400">Loading...</span>
                    <span className="text-xs text-green-500 font-medium">Live API</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}