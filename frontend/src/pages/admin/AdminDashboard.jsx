import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [stats, setStats] = useState({ total_users: 0, pending_kyc: 0, total_aum: 0 });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  // 1. Load Initial Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Admin Load Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. NEW: Filter Pending Tickets
  const filterPendingTickets = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/users/pending');
      setUsers(res.data); // Replaces the list with only those needing verification
    } catch (err) {
      console.error("Failed to load tickets:", err);
      alert("Could not fetch pending tickets. Ensure the backend route exists.");
    } finally {
      setLoading(false);
    }
  };

  // 3. View User Detail (Audit)
  const viewUserDetail = async (userId) => {
    try {
      const res = await client.get(`/admin/users/${userId}/full-data`);
      setSelectedUser(res.data);
    } catch (err) {
      console.error("Audit load failed:", err);
      alert("Error loading specific user records.");
    }
  };

  // 4. Approve KYC
  const approveUser = async (userId) => {
    try {
      await client.post(`/admin/users/${userId}/approve-kyc`);
      alert("User Verified Successfully");
      loadAdminData(); // Reset the view to show updated stats
      setSelectedUser(null);
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600 font-medium">Synchronizing Console...</div>;

  return (
    <div className="min-h-screen bg-[#F1F3F4] text-[#3C4043] font-sans antialiased">
      
      {/* GOOGLE BLUE TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#1A73E8] p-2 rounded-lg text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-[#202124]">Admin Management Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadAdminData} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md font-medium">Reset View</button>
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs uppercase">AD</div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8">
        
        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-2">Assets Under Management</p>
            <h3 className="text-3xl font-medium text-gray-900">₹{(stats.total_aum / 100000).toFixed(2)}L</h3>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-2">Platform Users</p>
            <h3 className="text-3xl font-medium text-gray-900">{stats.total_users}</h3>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-amber-400">
            <p className="text-sm font-medium text-gray-500 mb-1">KYC Tickets</p>
            <h3 className="text-3xl font-medium text-amber-900">{stats.pending_kyc}</h3>
            {/* GOOGLE-STYLE LINK BUTTON */}
            <button 
              onClick={filterPendingTickets}
              className="text-xs text-blue-600 font-bold mt-2 hover:underline inline-block"
            >
              Review all tickets
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-base font-medium text-gray-900 italic">User Directory</h2>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-8 py-4">Account Identity</th>
                <th className="px-8 py-4">Risk Profile</th>
                <th className="px-8 py-4">KYC Status</th>
                <th className="px-8 py-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.filter(u => u.role !== 'admin').map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                          {u.name?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase">
                      {u.risk_profile || 'Moderate'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase
                      ${u.kyc_status === 'Verified' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {u.kyc_status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => viewUserDetail(u.id)}
                      className="text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-md text-[10px] font-bold transition-all"
                    >
                      MANAGE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDE DRAWER (AUDIT PANEL) */}
        <AnimatePresence>
          {selectedUser && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[70] p-10 border-l border-gray-200 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-medium text-gray-900">User Configuration Audit</h2>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
                </div>

                {/* APPROVAL NOTICE */}
                {selectedUser.user.kyc_status === 'Pending' && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl mb-10 flex justify-between items-center">
                    <div>
                       <p className="text-amber-900 font-bold text-sm">Identity Review Pending</p>
                       <p className="text-amber-700 text-xs">Verify documentation before granting full access.</p>
                    </div>
                    <button 
                      onClick={() => approveUser(selectedUser.user.id)}
                      className="bg-[#1A73E8] text-white px-6 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-shadow"
                    >
                      APPROVE KYC
                    </button>
                  </div>
                )}

                <div className="space-y-10">
                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Investments</h4>
                    <div className="space-y-3">
                      {selectedUser.investments.map(inv => (
                        <div key={inv.id} className="p-4 bg-gray-50 rounded-lg flex justify-between border border-transparent hover:border-blue-200 transition-all">
                          <div>
                            <p className="text-xs font-bold text-gray-700 uppercase">{inv.asset_name}</p>
                            <p className="text-[10px] text-gray-400">Value: ₹{inv.current_value.toLocaleString()}</p>
                          </div>
                          <button className="text-red-300 hover:text-red-500 text-[10px] font-bold uppercase">Void</button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Active Goals</h4>
                    <div className="space-y-3">
                      {selectedUser.goals.map(goal => (
                        <div key={goal.id} className="p-4 bg-gray-50 rounded-lg flex justify-between border border-transparent hover:border-blue-200 transition-all">
                          <div>
                            <p className="text-xs font-bold text-gray-700 uppercase">{goal.title}</p>
                            <p className="text-[10px] text-gray-400">Target: ₹{goal.target_amount.toLocaleString()}</p>
                          </div>
                          <button className="text-red-300 hover:text-red-500 text-[10px] font-bold uppercase">Void</button>
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