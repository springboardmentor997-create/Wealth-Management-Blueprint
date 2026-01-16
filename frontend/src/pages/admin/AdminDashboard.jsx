import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const [stats, setStats] = useState({ total_users: 0, pending_kyc: 0, total_aum: 0, active_goals: 0 });
  const [chartData, setChartData] = useState({ risk_distribution: [], asset_allocation: [] });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, usersRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/charts'),
        client.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Admin Load Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPendingTickets = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/users/pending');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetail = async (userId) => {
    try {
      const res = await client.get(`/admin/users/${userId}/full-data`);
      setSelectedUser(res.data);
    } catch (err) {
      alert("Error loading specific user records.");
    }
  };

  const approveUser = async (userId) => {
    try {
      await client.post(`/admin/users/${userId}/approve-kyc`);
      alert("User Verified Successfully");
      loadAdminData();
      setSelectedUser(null);
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600 font-medium">Synchronizing Console...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#3C4043] font-sans antialiased">
      
      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-[#1A73E8] p-2 rounded-lg text-white shadow-blue-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#202124]">Admin Console</h1>
            <p className="text-xs text-gray-400">WealthPlan System Monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                SYSTEM ONLINE
            </div>
            <button onClick={loadAdminData} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md font-medium">Refresh</button>
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">AD</div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8">
        
        {/* 1. ANALYTICS CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Wealth (AUM)</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{(stats.total_aum / 100000).toFixed(2)}L</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Goals</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.active_goals || 0}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Action Required</p>
            <h3 className="text-2xl font-bold text-amber-900">{stats.pending_kyc} <span className="text-sm font-normal text-gray-400">Tickets</span></h3>
            <button onClick={filterPendingTickets} className="text-xs text-blue-600 font-bold mt-2 hover:underline">View Pending &rarr;</button>
          </div>
        </div>

        {/* 2. CHARTS SECTION (NEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart 1: Asset Distribution */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-6">Asset Allocation Overview</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData.asset_allocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.asset_allocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Risk Profiles */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-6">User Risk Profiles</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.risk_distribution}>
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" fill="#1A73E8" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 3. SYSTEM STATUS & LOGS (NEW) */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-6 mb-8 flex justify-between items-center shadow-lg">
            <div>
                <h3 className="text-white font-bold text-lg mb-1">Nightly Sync Service</h3>
                <p className="text-xs opacity-70">Background Worker (Celery/Redis)</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-mono mb-1">LAST RUN: TODAY 00:00 UTC</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 border border-green-700">
                    OPERATIONAL
                </span>
            </div>
        </div>

        {/* 4. DATA TABLE (Existing) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700">User Database</h2>
            <span className="text-xs text-gray-400">{users.length} Records found</span>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Risk Profile</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.filter(u => u.role !== 'admin').map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                          {u.name?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-700">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase">
                      {u.risk_profile || 'Moderate'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.kyc_status === 'Verified' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => viewUserDetail(u.id)}
                      className="text-gray-400 hover:text-blue-600 font-bold text-xs transition-colors"
                    >
                      EDIT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDE DRAWER (Existing logic, just cleaner UI) */}
        <AnimatePresence>
          {selectedUser && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[70] p-8 border-l border-gray-100 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedUser.user.name}</h2>
                      <p className="text-xs text-gray-400">{selectedUser.user.email}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">✕</button>
                </div>

                {selectedUser.user.kyc_status === 'Pending' && (
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg mb-8">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                             <span className="text-xl">⚠️</span>
                             <div>
                                 <p className="text-amber-900 font-bold text-sm">KYC Action Needed</p>
                                 <p className="text-amber-700 text-xs">Verify user documents.</p>
                             </div>
                        </div>
                    </div>
                    <button 
                      onClick={() => approveUser(selectedUser.user.id)}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-sm"
                    >
                      APPROVE IDENTITY
                    </button>
                  </div>
                )}

                <div className="space-y-8">
                  <section>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Holdings</h4>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedUser.investments.length} Assets</span>
                    </div>
                    <div className="space-y-2">
                      {selectedUser.investments.length === 0 && <p className="text-xs text-gray-300 italic">No assets found.</p>}
                      {selectedUser.investments.map(inv => (
                        <div key={inv.id} className="p-3 bg-white border border-gray-100 rounded hover:border-blue-300 transition-all flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{inv.asset_name}</p>
                            <p className="text-[10px] text-gray-400">Qty: {inv.units}</p>
                          </div>
                          <p className="text-xs font-mono font-medium text-gray-700">₹{inv.current_value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Goals</h4>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedUser.goals.length} Active</span>
                    </div>
                    <div className="space-y-2">
                      {selectedUser.goals.length === 0 && <p className="text-xs text-gray-300 italic">No goals set.</p>}
                      {selectedUser.goals.map(goal => (
                        <div key={goal.id} className="p-3 bg-white border border-gray-100 rounded hover:border-blue-300 transition-all shadow-sm">
                          <div className="flex justify-between mb-2">
                            <p className="text-xs font-bold text-gray-800">{goal.title}</p>
                            <p className="text-[10px] text-gray-500 font-mono">Target: ₹{goal.target_amount}</p>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((goal.saved_amount / goal.target_amount) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;